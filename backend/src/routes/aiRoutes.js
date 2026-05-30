import express from 'express';
import {
  analyzeJdAndScoreResume,
  streamResumeRewrite,
  acceptRewrite,
  rollbackRewrite,
  getHistoryLogs,
  getPlanStats,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkAiRewriteLimit } from '../middleware/planMiddleware.js';

const router = express.Router();

// JD parsing and direct ATS scoring
router.post('/analyze-jd', protect, analyzeJdAndScoreResume);

// SSE Streaming rewrites (using AI credit gates for Free tier)
router.get('/stream-rewrite', protect, checkAiRewriteLimit, streamResumeRewrite);

// Acceptance & rollbacks tracking
router.post('/accept', protect, acceptRewrite);
router.post('/rollback', protect, rollbackRewrite);

// Logging and plans configuration
router.get('/history/:resumeId', protect, getHistoryLogs);
router.get('/plan-stats', protect, getPlanStats);

export default router;
