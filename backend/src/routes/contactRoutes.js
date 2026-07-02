import express from 'express';
import { submitContactMessage } from '../controllers/contactController.js';
import { validateContactMessage } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', validateContactMessage, submitContactMessage);

export default router;
