import {
  createCheckoutSession,
  cancelSubscription,
  getBillingStatus,
  handleStripeWebhookEvent,
  constructWebhookEvent,
} from '../services/stripeService.js';

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
