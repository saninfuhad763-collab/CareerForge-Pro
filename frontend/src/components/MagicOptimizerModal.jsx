import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Target, Loader2, Check, RotateCcw } from 'lucide-react';

const MagicOptimizerModal = ({
  isOpen,
  onClose,
  magicPromptType,
  setMagicPromptType,
  targetKeyword,
  setTargetKeyword,
  originalText,
  optimizedText,
  isOptimizing,
  planStats,
  historyLogs,
  cancelOptimization,
  startStreamOptimization,
  applySuggestion,
  rollbackSuggestion,
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
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-pulse text-purple-200" />
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">
                    CareerForge AI Spark Assistant
                  </h3>
                  <p className="text-[10px] text-indigo-100 font-medium">
                    Real-time professional stream optimizer
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
              {/* Configuration panel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optimize Action</label>
                  <select
                    value={magicPromptType}
                    onChange={(e) => setMagicPromptType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="summary_rewrite">Professional Bio Rewrite</option>
                    <option value="bullet_rewrite">Resume Bullet Rewrite</option>
                    <option value="quantify">Quantify Achievements (+ Metrics)</option>
                    <option value="ats_inject">ATS Keyword Injection Focus</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-indigo-500" /> Focus Keyword (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AWS, React, Kubernetes..."
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Original content comparison */}
              {originalText && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Text</label>
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs text-slate-500 dark:text-slate-400 line-clamp-3 select-none">
                    {originalText}
                  </div>
                </div>
              )}

              {/* Live stream block */}
              <div className="space-y-1 relative">
                <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI Generated Suggestion
                </label>
                
                <div className="relative">
                  <textarea
                    rows={6}
                    readOnly
                    placeholder="Click 'Generate Suggestions' to initiate the streaming optimizer. The model will draft modern, impact-driven sentences in real time."
                    value={optimizedText}
                    className="w-full px-4 py-3 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/60 focus:outline-none rounded-2xl text-xs leading-relaxed font-medium text-slate-800 dark:text-slate-100 resize-none shadow-inner"
                  />
                  {isOptimizing && (
                    <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-950/10 backdrop-blur-[0.5px] rounded-2xl flex items-center justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border rounded-xl shadow-lg">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Streaming tokens...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[10px] font-medium text-slate-400">
                  Remaining credits: <span className="font-bold text-slate-600 dark:text-slate-300">{planStats.aiLimit === Infinity ? 'Unlimited' : `${planStats.aiLimit - planStats.aiRewriteCount} free credits left`}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isOptimizing ? (
                    <button
                      type="button"
                      onClick={cancelOptimization}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startStreamOptimization}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Optimizations</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!optimizedText || isOptimizing}
                    onClick={applySuggestion}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Changes</span>
                  </button>
                </div>
              </div>

              {/* Audit trail & Rollbacks */}
              {historyLogs.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    History / Undo Actions
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {historyLogs.slice(0, 3).map((log) => (
                      <div
                        key={log._id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs"
                      >
                        <div className="space-y-0.5 text-left min-w-0">
                          <div className="font-bold capitalize text-slate-700 dark:text-slate-300">
                            {log.actionType.replace('_', ' ')}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[320px]">
                            {log.generatedContent}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => rollbackSuggestion(log._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold border border-amber-200/40 dark:border-amber-900/40 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Undo</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MagicOptimizerModal;
