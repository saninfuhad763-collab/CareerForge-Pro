import React from 'react';

/**
 * SkipLink provides a keyboard-accessible shortcut for screen reader and keyboard users
 * to bypass repetitive navigation elements directly to the main content landmark.
 *
 * It remains visually offscreen until focused via keyboard Tab navigation, at which point
 * it appears prominently at the top of the viewport.
 */
const SkipLink = ({ targetId = 'main-content', label = 'Skip to main content' }) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-indigo-600 focus:text-white focus:font-bold focus:text-sm focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 transition-all duration-150"
    >
      {label}
    </a>
  );
};

export default SkipLink;
