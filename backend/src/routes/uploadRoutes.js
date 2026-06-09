import express from 'express';
import multer from 'multer';
import { importResume } from '../controllers/resumeImportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isSupportedResumeFile } from '../services/resumeImportService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!isSupportedResumeFile(file)) {
      return cb(new Error('Unsupported file type. Please upload a PDF or DOCX resume.'));
    }
    cb(null, true);
  },
});

const handleUploadErrors = (req, res, next) => {
  upload.single('resume')(req, res, (error) => {
    if (!error) return next();

    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Resume file is too large. Please upload a PDF or DOCX under 8MB.'
      : error.message || 'Resume upload failed. Please try again.';

    return res.status(400).json({ success: false, message });
  });
};

router.post('/resume', protect, handleUploadErrors, importResume);

export default router;
