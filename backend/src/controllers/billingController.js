import crypto from 'crypto';
import {
  createCheckoutSession,
  cancelSubscription as cancelStripeSubscriptionService,
  getBillingStatus,
  handleStripeWebhookEvent,
  constructWebhookEvent,
} from '../services/stripeService.js';
import {
  createSubscription as createRazorpaySubscriptionService,
  verifySubscriptionPayment as verifyRazorpaySubscriptionPaymentService,
  validateWebhookSignature as validateRazorpayWebhookSignatureService,
  handleRazorpayWebhookEvent,
  cancelSubscription as cancelRazorpaySubscriptionService,
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
    const user = req.user;
    const { cancelAtPeriodEnd = true } = req.body || {};

    const isRazorpay =
      user.subscriptionProvider === 'razorpay' ||
      (!user.subscriptionProvider && Boolean(user.razorpaySubscriptionId));
    const isStripe =
      user.subscriptionProvider === 'stripe' ||
      (!user.subscriptionProvider && Boolean(user.stripeSubscriptionId));

    if (isRazorpay && user.razorpaySubscriptionId) {
      const result = await cancelRazorpaySubscriptionService(user, {
        cancelAtPeriodEnd: cancelAtPeriodEnd !== false,
      });

      return res.status(200).json({
        success: true,
        message: result.cancelAtPeriodEnd
          ? 'Subscription will cancel at the end of the current billing period.'
          : 'Subscription has been cancelled immediately.',
        data: result,
      });
    }

    if (isStripe && user.stripeSubscriptionId) {
      const subscription = await cancelStripeSubscriptionService(user);

      return res.status(200).json({
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
    }

    return res.status(400).json({
      success: false,
      message: 'No active subscription found for this account.',
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

const getSafeEnvMetadata = () => {
  const rawKeyId = process.env.RAZORPAY_KEY_ID;
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const rawPlanId = process.env.RAZORPAY_PLAN_ID;

  const checkQuotesOrWhitespace = (val) => {
    if (!val) return { whitespace: 'NO', quotes: 'NO' };
    const hasWhitespace = /^\s|\s$/.test(val);
    const hasQuotes = /^["'].*["']$/.test(val.trim());
    return {
      whitespace: hasWhitespace ? 'YES' : 'NO',
      quotes: hasQuotes ? 'YES' : 'NO',
    };
  };

  const planDiag = checkQuotesOrWhitespace(rawPlanId);
  const keyIdDiag = checkQuotesOrWhitespace(rawKeyId);
  const secretDiag = checkQuotesOrWhitespace(rawKeySecret);

  const cleanKeyId = (rawKeyId || '').trim().replace(/^["']|["']$/g, '');
  const cleanPlanId = (rawPlanId || '').trim().replace(/^["']|["']$/g, '');

  const planFingerprint = rawPlanId
    ? crypto.createHash('sha256').update(cleanPlanId).digest('hex').slice(0, 8)
    : 'NONE';

  return {
    RAZORPAY_KEY_ID: rawKeyId ? 'PRESENT' : 'ABSENT',
    RAZORPAY_KEY_ID_mode: cleanKeyId.startsWith('rzp_test_')
      ? 'TEST'
      : cleanKeyId.startsWith('rzp_live_')
      ? 'LIVE'
      : 'UNKNOWN',
    RAZORPAY_KEY_ID_quotes: keyIdDiag.quotes,
    RAZORPAY_KEY_ID_whitespace: keyIdDiag.whitespace,
    RAZORPAY_KEY_SECRET: rawKeySecret ? 'PRESENT' : 'ABSENT',
    RAZORPAY_KEY_SECRET_quotes: secretDiag.quotes,
    RAZORPAY_KEY_SECRET_whitespace: secretDiag.whitespace,
    RAZORPAY_PLAN_ID: rawPlanId ? 'PRESENT' : 'ABSENT',
    RAZORPAY_PLAN_ID_format: cleanPlanId.startsWith('plan_') ? 'VALID_PREFIX' : 'INVALID_PREFIX',
    RAZORPAY_PLAN_ID_quotes: planDiag.quotes,
    RAZORPAY_PLAN_ID_whitespace: planDiag.whitespace,
    RAZORPAY_PLAN_ID_fingerprint: planFingerprint,
  };
};

/**
 * Creates a Razorpay Subscription for the authenticated user
 * Route: POST /api/billing/razorpay/create-subscription
 */
export const createRazorpaySubscription = async (req, res, next) => {
  try {
    console.log('[Razorpay Diagnostic] Environment metadata:', JSON.stringify(getSafeEnvMetadata()));

    const subscriptionData = await createRazorpaySubscriptionService(req.user);

    res.status(200).json({
      success: true,
      data: subscriptionData,
    });
  } catch (error) {
    const razorpayErr = error.error || {};
    console.error('[Razorpay Diagnostic] Subscription creation failure:', {
      statusCode: error.statusCode || error.status || 500,
      code: razorpayErr.code || error.code || 'UNKNOWN',
      description: razorpayErr.description || error.description || error.message || 'No description provided',
      source: razorpayErr.source || undefined,
      step: razorpayErr.step || undefined,
      reason: razorpayErr.reason || undefined,
      field: razorpayErr.field || undefined,
    });
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

