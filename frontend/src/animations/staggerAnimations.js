import { premiumEase, isReducedMotionEnabled } from './motionVariants';

export const staggerContainer = (staggerDelay = 0.08) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isReducedMotionEnabled() ? 0 : staggerDelay,
      delayChildren: 0.05,
    },
  },
});

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: isReducedMotionEnabled() ? 0 : 15 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: premiumEase,
    },
  },
};

export const staggerItemScale = {
  hidden: { 
    opacity: 0, 
    scale: isReducedMotionEnabled() ? 1 : 0.96, 
    y: isReducedMotionEnabled() ? 0 : 10 
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};
