import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createCheckout,
  getStatus,
  cancelUserSubscription,
  createRazorpaySubscription,
  verifyRazorpayPayment,
} from '../controllers/billingController.js';

const router = express.Router();

// Common / Stripe Routes
router.get('/status', protect, getStatus);
router.post('/create-checkout-session', protect, createCheckout);
router.post('/cancel-subscription', protect, cancelUserSubscription);

// Razorpay Subscriptions Routes
router.post('/razorpay/create-subscription', protect, createRazorpaySubscription);
router.post('/razorpay/verify-payment', protect, verifyRazorpayPayment);

export default router;

