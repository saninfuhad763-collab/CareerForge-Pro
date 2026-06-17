import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createCheckout,
  getStatus,
  cancelUserSubscription,
} from '../controllers/billingController.js';

const router = express.Router();

router.get('/status', protect, getStatus);
router.post('/create-checkout-session', protect, createCheckout);
router.post('/cancel-subscription', protect, cancelUserSubscription);

export default router;
