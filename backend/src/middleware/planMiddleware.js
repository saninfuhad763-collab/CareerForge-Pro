import Resume from '../models/Resume.js';
import { isPremiumTemplate, isProPlan } from '../utils/planConstants.js';

/**
 * Feature gate middleware to enforce maximum resume limits based on subscription plan
 */
export const checkResumeLimit = async (req, res, next) => {
  try {
    const user = req.user; // Set by protect middleware
    
    if (!isProPlan(user)) {
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
    
    if (!isProPlan(user)) {
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

/**
 * Reject premium template usage for free-tier users
 */
export const checkPremiumTemplate = (req, res, next) => {
  const templateId = req.body?.templateId;
  if (!templateId || !isPremiumTemplate(templateId)) {
    return next();
  }

  if (!isProPlan(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'Classic and Minimalist templates are Pro-only. Upgrade to unlock premium templates.',
      requiresUpgrade: true,
      allowedTemplates: ['modern'],
    });
  }

  return next();
};

/**
 * Reject cover letter access for free-tier users
 */
export const checkCoverLetterAccess = (req, res, next) => {
  if (!isProPlan(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'Cover Letter features are Pro-only. Upgrade to Pro to unlock cover letter generation, premium templates, and unlimited resumes!',
      requiresUpgrade: true,
    });
  }
  next();
};

