import { premiumEase, isReducedMotionEnabled } from './motionVariants';

export const pageTransitions = {
  initial: {
    opacity: 0,
    y: isReducedMotionEnabled() ? 0 : 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: isReducedMotionEnabled() ? 0 : -15,
    transition: {
      duration: 0.35,
      ease: premiumEase,
    },
  },
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};
