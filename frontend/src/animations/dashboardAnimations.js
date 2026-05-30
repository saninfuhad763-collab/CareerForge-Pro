import { premiumEase, isReducedMotionEnabled } from './motionVariants';

export const sidebarItemVariant = {
  hover: {
    x: isReducedMotionEnabled() ? 0 : 4,
    transition: {
      duration: 0.2,
      ease: premiumEase,
    },
  },
};

export const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isReducedMotionEnabled() ? 0 : 0.05,
    },
  },
};

export const listItemVariant = {
  hidden: { 
    opacity: 0, 
    x: isReducedMotionEnabled() ? 0 : -10 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: premiumEase,
    },
  },
};

export const skeletonPulse = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.85, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const glowPulse = {
  initial: { opacity: 0.3, scale: 0.98 },
  animate: {
    opacity: [0.3, 0.55, 0.3],
    scale: [0.98, 1.01, 0.98],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
