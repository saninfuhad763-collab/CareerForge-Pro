import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

const SummarySection = ({
  activeAccordion,
  toggleAccordion,
  summary,
  handleSummaryChange,
  openMagicOptimizer,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => toggleAccordion('summary')}
        className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Professional Summary</span>
        </div>
        {activeAccordion === 'summary' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
      </button>

      <AnimatePresence>
        {activeAccordion === 'summary' && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
          >
            <div className="p-5 space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Bio</label>
              <textarea
                rows={4}
                placeholder="Write a compelling, core target profile summarizing your experience and top skills..."
                value={summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
              />
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => openMagicOptimizer('summary', summary, (newVal) => handleSummaryChange(newVal))}
                  className="inline-flex items-center gap-1 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-500/25 cursor-pointer hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-150"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Magic AI Rewrite</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SummarySection;
