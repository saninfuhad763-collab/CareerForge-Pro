import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const UploadResumeModal = ({
  isOpen,
  onClose,
  isImportingResume,
  selectedResumeFile,
  uploadError,
  uploadSuccess,
  handleResumeFileChange,
  handleResumeImport,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-left"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-100" />
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Upload Existing Resume</h3>
                  <p className="text-[10px] text-indigo-100 font-medium">Import a PDF or DOCX into the builder schema</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isImportingResume}
                className="text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/40 text-center">
                <Upload className="w-9 h-9 mx-auto text-indigo-500 mb-3" />
                <label className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/20">
                  Choose PDF or DOCX
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeFileChange}
                    disabled={isImportingResume}
                    className="sr-only"
                  />
                </label>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedResumeFile ? selectedResumeFile.name : 'Supported formats: .pdf and .docx'}
                </p>
              </div>

              {uploadError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                CareerForge will extract text, use AI to map it into your existing resume fields, update this builder, and save through the current save flow.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 text-xs shrink-0">
              <button
                onClick={onClose}
                disabled={isImportingResume}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResumeImport}
                disabled={isImportingResume || !selectedResumeFile}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImportingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isImportingResume ? 'Importing...' : 'Import Resume'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadResumeModal;
