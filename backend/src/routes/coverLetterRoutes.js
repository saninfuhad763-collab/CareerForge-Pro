import express from 'express';
import {
  saveCoverLetter,
  getCoverLetters,
  deleteCoverLetter,
} from '../controllers/coverLetterPersistenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, saveCoverLetter)
  .get(protect, getCoverLetters);

router.route('/:id')
  .delete(protect, deleteCoverLetter);

export default router;
