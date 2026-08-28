import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';

let razorpayClient = null;

/**
 * Initializes or returns the singleton Razorpay client instance
 */
export const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.');
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
};

/**
 * Creates a recurring monthly Pro subscription in Razorpay.
 * NOTE: Creating a subscription does NOT grant Pro access. Pro access is granted only upon verified authorization.
 */
export const createSubscription = async (user) => {
  const razorpay = getRazorpay();
  const planId = process.env.RAZORPAY_PLAN_ID;

  if (!planId) {
    throw new Error('RAZORPAY_PLAN_ID is not configured.');
  }

  // Create subscription with user ID tagged in notes for webhook reconciliation
  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 120, // 10 years of monthly billing cycles
    quantity: 1,
    customer_notify: 1,
    notes: {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    },
  });

  // Track the pending subscription ID on user without elevating plan
  user.subscriptionProvider = 'razorpay';
  user.razorpaySubscriptionId = subscription.id;
  await user.save();

  return {
    subscriptionId: subscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    status: subscription.status,
  };
};

/**
 * Constant-time safe string comparison to prevent timing attacks
 */
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Verifies the payment response received from Razorpay Subscriptions Checkout modal.
 * Signature contract: HMAC_SHA256(razorpay_payment_id + '|' + razorpay_subscription_id, RAZORPAY_KEY_SECRET)
 */
export const verifySubscriptionPayment = async (user, { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }) => {
  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    throw new Error('Missing required verification parameters.');
  }

  // Finding 1: Strict Subscription Ownership Check
  // Require that the authenticated user initiated this subscription
  if (!user.razorpaySubscriptionId || user.razorpaySubscriptionId !== razorpay_subscription_id) {
    throw new Error('Subscription ID does not match the pending subscription for this user.');
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured.');
  }

  const payload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  const isValid = safeCompare(expectedSignature, razorpay_signature);
  if (!isValid) {
    throw new Error('Invalid payment signature. Verification failed.');
  }

  // Update user entitlement upon verified signature and verified ownership
  user.subscriptionProvider = 'razorpay';
  user.razorpaySubscriptionId = razorpay_subscription_id;
  user.razorpayPaymentId = razorpay_payment_id;
  user.plan = 'PRO';
  user.subscriptionStatus = 'active';
  
  // Set initial period anchor until authoritative billing webhook delivers current_end
  user.subscriptionExpiresAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
  await user.save();

  return {
    verified: true,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
  };
};

/**
 * Validates Razorpay Webhook Signature against original raw request body
 */
export const validateWebhookSignature = (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured.');
  }

  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return safeCompare(expectedSignature, signature);
};

/**
 * Processes authoritative subscription lifecycle webhook events from Razorpay
 */
export const handleRazorpayWebhookEvent = async (event) => {
  const eventType = event.event;
  const payload = event.payload;

  if (!payload || !payload.subscription) {
    return { ignored: true, reason: 'No subscription payload found' };
  }

  const subEntity = payload.subscription.entity;
  const subscriptionId = subEntity?.id;
  const userIdFromNotes = subEntity?.notes?.userId;

  let user = null;
  if (userIdFromNotes) {
    user = await User.findById(userIdFromNotes);
  }

  if (!user && subscriptionId) {
    user = await User.findOne({ razorpaySubscriptionId: subscriptionId });
  }

  if (!user) {
    return { ignored: true, reason: 'User not found for subscription event' };
  }

  // Universal subscription ID ownership guard — must execute before ANY mutation.
  // Rejects stale, foreign, or obsolete subscription events that do not match the
  // user's currently stored Razorpay subscription ID.
  // Guard fires only when BOTH IDs are present and they do not match.
  if (
    user.razorpaySubscriptionId &&
    subscriptionId &&
    user.razorpaySubscriptionId !== subscriptionId
  ) {
    return {
      ignored: true,
      reason: 'Subscription ID mismatch — stale or foreign event rejected',
    };
  }

  // Update payment reference if payment entity is present in payload
  if (payload.payment?.entity?.id) {
    user.razorpayPaymentId = payload.payment.entity.id;
  }

  // Sync current_end if authoritative timestamp is available
  if (typeof subEntity.current_end === 'number' && subEntity.current_end > 0) {
    user.subscriptionExpiresAt = new Date(subEntity.current_end * 1000);
  }

  switch (eventType) {
    case 'subscription.authenticated':
    case 'subscription.activated': {
      user.subscriptionProvider = 'razorpay';
      user.razorpaySubscriptionId = subscriptionId;
      user.plan = 'PRO';
      user.subscriptionStatus = 'active';
      await user.save();
      return { handled: true, event: eventType, plan: user.plan };
    }

    case 'subscription.charged': {
      // Finding 3: Out-of-order & stale event protection
      // Do not reactivate a subscription that has already transitioned to a terminal cancelled state
      if (user.subscriptionStatus === 'canceled' || subEntity.status === 'cancelled') {
        return { ignored: true, reason: 'Ignored charged event for cancelled subscription' };
      }
      // Do not accept charge events for a mismatched or obsolete subscription ID
      if (user.razorpaySubscriptionId && user.razorpaySubscriptionId !== subscriptionId) {
        return { ignored: true, reason: 'Ignored charged event for mismatched subscription ID' };
      }

      user.subscriptionProvider = 'razorpay';
      user.razorpaySubscriptionId = subscriptionId;
      user.plan = 'PRO';
      user.subscriptionStatus = 'active';

      // Finding 2: Deterministic expiration only - do not invent or guess expiration dates
      if (typeof subEntity.current_end === 'number' && subEntity.current_end > 0) {
        user.subscriptionExpiresAt = new Date(subEntity.current_end * 1000);
      }

      await user.save();
      return { handled: true, event: eventType, plan: user.plan };
    }

    case 'subscription.cancelled': {
      user.plan = 'FREE';
      user.subscriptionStatus = 'canceled';
      await user.save();
      return { handled: true, event: eventType, plan: user.plan };
    }

    case 'subscription.halted': {
      // Auto-debit failed repeatedly; revoke Pro access
      user.plan = 'FREE';
      user.subscriptionStatus = 'past_due';
      await user.save();
      return { handled: true, event: eventType, plan: user.plan };
    }

    case 'subscription.paused': {
      user.plan = 'FREE';
      user.subscriptionStatus = 'paused';
      await user.save();
      return { handled: true, event: eventType, plan: user.plan };
    }

    case 'subscription.resumed': {
      user.plan = 'PRO';
      user.subscriptionStatus = 'active';
      await user.save();
      return { handled: true, event: eventType, plan: user.plan };
    }

    default:
      return { ignored: true, event: eventType };
  }
};
