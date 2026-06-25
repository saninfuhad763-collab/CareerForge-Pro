import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { premiumEase } from '../animations/motionVariants';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, description }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? onClose : undefined}
          />

          {/* Modal Box */}
          <motion.div
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative z-10 space-y-5"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: premiumEase }}
          >
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100 text-left">{title}</h3>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal text-left">
              {description}
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md shadow-red-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;
