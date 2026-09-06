import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { premiumEase } from '../animations/motionVariants';

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  widthClass = 'w-72 sm:w-80 max-w-[85vw]',
  zIndexClass = 'z-50',
  ariaLabel = 'Navigation Drawer',
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 ${zIndexClass} overflow-hidden`}>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : ariaLabel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: premiumEase }}
            className={`fixed top-0 right-0 bottom-0 ${widthClass} h-full bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col text-slate-800 dark:text-slate-100 z-10`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="font-bold font-display text-sm text-slate-800 dark:text-slate-100 truncate">
                {title}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
