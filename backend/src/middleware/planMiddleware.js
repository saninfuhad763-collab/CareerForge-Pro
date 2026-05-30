import Resume from '../models/Resume.js';

/**
 * Feature gate middleware to enforce maximum resume limits based on subscription plan
 */
export const checkResumeLimit = async (req, res, next) => {
  try {
    const user = req.user; // Set by protect middleware
    
    if (user.plan === 'FREE') {
      const count = await Resume.countDocuments({ userId: user._id });
      if (count >= 1) {
        return res.status(403).json({
          success: false,
          message: 'Free tier is limited to exactly 1 resume. Upgrade to Pro to unlock unlimited resume generation, premium templates, and cover letters!',
          requiresUpgrade: true
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Feature gate middleware to enforce AI rewrite limits based on subscription plan
 */
export const checkAiRewriteLimit = async (req, res, next) => {
  try {
    const user = req.user; // Set by protect middleware
    
    if (user.plan === 'FREE') {
      if (user.aiRewriteCount >= 10) {
        return res.status(403).json({
          success: false,
          message: 'You have reached the maximum free limit of 10 AI rewrites. Upgrade to Pro to unlock unlimited AI-powered editing and live streaming enhancements!',
          requiresUpgrade: true
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
