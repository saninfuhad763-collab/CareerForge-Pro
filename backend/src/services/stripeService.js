import Stripe from 'stripe';
import User from '../models/User.js';

let stripeClient = null;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

export const syncUserPlanFromSubscription = (user, subscription) => {
  const status = subscription?.status || 'none';
  user.subscriptionStatus = status;
  user.stripeSubscriptionId = subscription?.id || user.stripeSubscriptionId || null;

  if (subscription?.current_period_end) {
    user.subscriptionExpiresAt = new Date(subscription.current_period_end * 1000);
  }

  if (['active', 'trialing'].includes(status)) {
    user.plan = 'PRO';
  } else if (['canceled', 'unpaid', 'incomplete_expired', 'past_due'].includes(status)) {
    user.plan = 'FREE';
  }

  return user;
};

export const createCheckoutSession = async (user) => {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    throw new Error('STRIPE_PRICE_ID is not configured.');
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${getClientUrl()}/billing?checkout=success`,
    cancel_url: `${getClientUrl()}/billing?checkout=cancelled`,
    metadata: {
      userId: user._id.toString(),
    },
    subscription_data: {
      metadata: {
        userId: user._id.toString(),
      },
    },
  });

  return session;
};

export const cancelSubscription = async (user) => {
  const stripe = getStripe();

  if (!user.stripeSubscriptionId) {
    throw new Error('No active subscription found for this account.');
  }

  const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  syncUserPlanFromSubscription(user, subscription);
  await user.save();

  return subscription;
};

export const getBillingStatus = async (user) => {
  const stripe = getStripe();
  let subscription = null;

  if (user.stripeSubscriptionId) {
    try {
      subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    } catch (error) {
      if (error.statusCode !== 404) {
        throw error;
      }
    }
  }

  return {
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus || 'none',
    subscriptionExpiresAt: user.subscriptionExpiresAt || null,
    stripeCustomerId: user.stripeCustomerId || null,
    hasActiveSubscription: ['active', 'trialing'].includes(user.subscriptionStatus),
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        }
      : null,
  };
};

export const handleStripeWebhookEvent = async (event) => {
  const stripe = getStripe();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) return;

      const user = await User.findById(userId);
      if (!user) return;

      if (session.customer) {
        user.stripeCustomerId = session.customer;
      }

      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        syncUserPlanFromSubscription(user, subscription);
      } else {
        user.plan = 'PRO';
        user.subscriptionStatus = 'active';
      }

      await user.save();
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      let user = userId ? await User.findById(userId) : null;

      if (!user && subscription.customer) {
        user = await User.findOne({ stripeCustomerId: subscription.customer });
      }

      if (!user) return;

      user.stripeCustomerId = subscription.customer;
      syncUserPlanFromSubscription(user, subscription);
      await user.save();
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      let user = await User.findOne({ stripeSubscriptionId: subscription.id });

      if (!user && subscription.customer) {
        user = await User.findOne({ stripeCustomerId: subscription.customer });
      }

      if (!user) return;

      user.plan = 'FREE';
      user.subscriptionStatus = 'canceled';
      user.stripeSubscriptionId = null;
      user.subscriptionExpiresAt = null;
      await user.save();
      break;
    }

    default:
      break;
  }
};

export const constructWebhookEvent = (rawBody, signature) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
};
