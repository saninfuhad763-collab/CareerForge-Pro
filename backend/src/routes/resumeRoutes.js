import express from 'express';
import {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateResume } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getResumes)
  .post(protect, validateResume, createResume);

router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, validateResume, updateResume)
  .delete(protect, deleteResume);

export default router;
