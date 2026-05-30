/**
 * Global Motion Design System for CareerForge Pro
 * Inspired by Linear, Vercel, Stripe, and Arc Browser
 */

// Premium Easing Curve (cubic-bezier)
export const premiumEase = [0.22, 1, 0.36, 1];

// Helper to check for prefers-reduced-motion in React
export const isReducedMotionEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Global Micro Interactions (150-250ms)
export const microTransition = {
  duration: 0.2,
  ease: premiumEase
};

// Cards Transitions (300-450ms)
export const cardTransition = {
  duration: 0.35,
  ease: premiumEase
};

// Sections Transitions (500-700ms)
export const sectionTransition = {
  duration: 0.6,
  ease: premiumEase
};

// Page Transitions (500-800ms)
export const pageTransition = {
  duration: 0.75,
  ease: premiumEase
};
