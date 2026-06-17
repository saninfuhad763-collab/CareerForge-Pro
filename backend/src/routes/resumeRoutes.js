import express from 'express';
import {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  exportResumePdf,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateResume } from '../middleware/validationMiddleware.js';
import { checkResumeLimit, checkPremiumTemplate } from '../middleware/planMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getResumes)
  .post(protect, checkResumeLimit, checkPremiumTemplate, validateResume, createResume);

router.post('/:id/export-pdf', protect, exportResumePdf);

router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, checkPremiumTemplate, validateResume, updateResume)
  .delete(protect, deleteResume);

export default router;
