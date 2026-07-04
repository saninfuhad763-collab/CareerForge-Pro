import express from 'express';
import {
  saveCoverLetter,
  getCoverLetters,
  deleteCoverLetter,
  exportCoverLetterPdf,
} from '../controllers/coverLetterPersistenceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkCoverLetterAccess } from '../middleware/planMiddleware.js';

const router = express.Router();

// Enforce authentication and Pro-tier access for all cover letter persistence endpoints
router.use(protect);
router.use(checkCoverLetterAccess);

router.route('/')
  .post(saveCoverLetter)
  .get(getCoverLetters);

router.post('/:id/export-pdf', exportCoverLetterPdf);

router.route('/:id')
  .delete(deleteCoverLetter);

export default router;
