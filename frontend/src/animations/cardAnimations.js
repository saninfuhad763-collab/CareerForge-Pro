import { premiumEase, isReducedMotionEnabled } from './motionVariants';

// Premium Card Hover (subtle lift + scale + soft shadow shift)
export const premiumCardHover = {
  initial: { 
    y: 0,
    scale: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)'
  },
  hover: {
    y: isReducedMotionEnabled() ? 0 : -6,
    scale: isReducedMotionEnabled() ? 1 : 1.015,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
    transition: {
      duration: 0.35,
      ease: premiumEase,
    },
  },
};

// Senior-level Resume Card Variant with 3D depth, entrance stagger, and glow matching Stripe/Notion AI dashboard
export const resumeCardVariant = {
  hidden: {
    opacity: 0,
    y: isReducedMotionEnabled() ? 0 : 20,
    scale: 0.98,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
    rotateX: 0,
    rotateY: 0,
    transformPerspective: 1000
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
    rotateX: 0,
    rotateY: 0,
    transformPerspective: 1000,
    transition: {
      duration: 0.45,
      ease: premiumEase
    }
  },
  hover: {
    y: isReducedMotionEnabled() ? 0 : -6,
    scale: isReducedMotionEnabled() ? 1 : 1.018,
    rotateX: isReducedMotionEnabled() ? 0 : 2, 
    rotateY: isReducedMotionEnabled() ? 0 : -1,
    transformPerspective: 1000,
    boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.08), 0 8px 10px -6px rgba(99, 102, 241, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.15)',
    transition: {
      duration: 0.35,
      ease: premiumEase
    }
  }
};

// Subtle Card Tilt (2-3 degrees)
export const cardTiltLeft = {
  hover: {
    rotate: isReducedMotionEnabled() ? 0 : -2,
    y: isReducedMotionEnabled() ? 0 : -4,
    transition: {
      duration: 0.3,
      ease: premiumEase,
    },
  },
};

export const cardTiltRight = {
  hover: {
    rotate: isReducedMotionEnabled() ? 0 : 2,
    y: isReducedMotionEnabled() ? 0 : -4,
    transition: {
      duration: 0.3,
      ease: premiumEase,
    },
  },
};

// Button Micro-interaction Bounce
export const buttonScale = {
  initial: { scale: 1 },
  hover: {
    scale: isReducedMotionEnabled() ? 1 : 1.03,
    y: isReducedMotionEnabled() ? 0 : -1,
    transition: {
      duration: 0.2,
      ease: premiumEase,
    },
  },
  tap: {
    scale: isReducedMotionEnabled() ? 1 : 0.97,
    transition: {
      duration: 0.1,
      ease: premiumEase,
    },
  },
};

// Sleek, modern, and highly professional SaaS layout hover & entry animation variant
export const professionalCardVariant = {
  hidden: { 
    opacity: 0, 
    y: isReducedMotionEnabled() ? 0 : 20,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: premiumEase
    }
  },
  hover: {
    y: isReducedMotionEnabled() ? 0 : -4,
    scale: isReducedMotionEnabled() ? 1 : 1.012,
    boxShadow: '0 12px 30px -10px rgba(99, 102, 241, 0.12), 0 4px 12px -5px rgba(99, 102, 241, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.18)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    transition: {
      duration: 0.3,
      ease: premiumEase
    }
  },
  tap: {
    scale: 0.985,
    transition: {
      duration: 0.1,
      ease: premiumEase
    }
  }
};


