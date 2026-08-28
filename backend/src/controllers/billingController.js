import {
  createCheckoutSession,
  cancelSubscription,
  getBillingStatus,
  handleStripeWebhookEvent,
  constructWebhookEvent,
} from '../services/stripeService.js';
import {
  createSubscription as createRazorpaySubscriptionService,
  verifySubscriptionPayment as verifyRazorpaySubscriptionPaymentService,
  validateWebhookSignature as validateRazorpayWebhookSignatureService,
  handleRazorpayWebhookEvent,
} from '../services/razorpayService.js';

export const createCheckout = async (req, res, next) => {
  try {
    const session = await createCheckoutSession(req.user);

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const status = await getBillingStatus(req.user);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelUserSubscription = async (req, res, next) => {
  try {
    const subscription = await cancelSubscription(req.user);

    res.status(200).json({
      success: true,
      message: 'Subscription will cancel at the end of the current billing period.',
      data: {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    const event = constructWebhookEvent(req.body, signature);
    await handleStripeWebhookEvent(event);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Verification/handling failed:', error.message);
    res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }
};

/**
 * Creates a Razorpay Subscription for the authenticated user
 * Route: POST /api/billing/razorpay/create-subscription
 */
export const createRazorpaySubscription = async (req, res, next) => {
  try {
    const subscriptionData = await createRazorpaySubscriptionService(req.user);

    res.status(200).json({
      success: true,
      data: subscriptionData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verifies Razorpay Subscription Payment signature and updates entitlement
 * Route: POST /api/billing/razorpay/verify-payment
 */
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

    const result = await verifyRazorpaySubscriptionPaymentService(req.user, {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Pro subscription activated.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Payment signature verification failed.',
    });
  }
};

/**
 * Handles incoming server-to-server Razorpay Webhook events
 * Route: POST /api/billing/razorpay-webhook
 */
export const razorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  try {
    const rawBody = req.body; // Buffer from express.raw()
    const isValid = validateRazorpayWebhookSignatureService(rawBody, signature);

    if (!isValid) {
      console.warn('[Razorpay Webhook] Invalid signature rejected.');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const result = await handleRazorpayWebhookEvent(event);

    res.status(200).json({
      success: true,
      received: true,
      result,
    });
  } catch (error) {
    console.error('[Razorpay Webhook] Error processing event:', error.message);
    res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`,
    });
  }
};

