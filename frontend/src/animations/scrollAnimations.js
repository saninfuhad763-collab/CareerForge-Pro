import { premiumEase, isReducedMotionEnabled } from './motionVariants';

export const scrollReveal = {
  hidden: { 
    opacity: 0, 
    y: isReducedMotionEnabled() ? 0 : 35,
    scale: isReducedMotionEnabled() ? 1 : 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: premiumEase,
    },
  },
};

export const progressConnector = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: {
      duration: 0.8,
      ease: premiumEase,
    },
  },
};
