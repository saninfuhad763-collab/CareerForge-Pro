import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronUp, ChevronDown, Trash2, Sparkles, Plus } from 'lucide-react';

const ExperienceSection = ({
  activeAccordion,
  toggleAccordion,
  experience,
  handleRemoveExperience,
  handleUpdateExperience,
  openMagicOptimizer,
  handleAddExperience,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => toggleAccordion('experience')}
        className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-indigo-500" />
          <span>Experience ({experience.length})</span>
        </div>
        {activeAccordion === 'experience' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
      </button>

      <AnimatePresence>
        {activeAccordion === 'experience' && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
          >
            <div className="p-5 space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRemoveExperience(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Position #{idx + 1}</h6>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Company</label>
                      <input
                        type="text"
                        placeholder="Google"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Role Title</label>
                      <input
                        type="text"
                        placeholder="Senior Engineer"
                        value={exp.position}
                        onChange={(e) => handleUpdateExperience(idx, 'position', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Location</label>
                      <input
                        type="text"
                        placeholder="Remote"
                        value={exp.location}
                        onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Start Date</label>
                      <input
                        type="text"
                        placeholder="Jan 2024"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(idx, 'startDate', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">End Date</label>
                      <input
                        type="text"
                        placeholder="Present"
                        disabled={exp.current}
                        value={exp.current ? 'Present' : exp.endDate}
                        onChange={(e) => handleUpdateExperience(idx, 'endDate', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none disabled:opacity-55"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-\${idx}`}
                      checked={exp.current}
                      onChange={(e) => handleUpdateExperience(idx, 'current', e.target.checked)}
                      className="w-3.5 h-3.5 text-indigo-600 bg-white dark:bg-slate-900 border-slate-200 rounded"
                    />
                    <label htmlFor={`current-\${idx}`} className="text-[10px] font-bold text-slate-500">I currently work here</label>
                  </div>

                   <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Impact & Responsibilities (Bulleted)</label>
                    <textarea
                      rows={3}
                      placeholder="- Implemented scalable Node APIs boosting throughput by 30%&#10;- Led team of 4 engineers..."
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => openMagicOptimizer('bullet', exp.description, (newVal) => handleUpdateExperience(idx, 'description', newVal))}
                        disabled={!exp.description.trim()}
                        title={!exp.description.trim() ? "Please write a draft bullet first to enable AI optimization." : undefined}
                        className="inline-flex items-center gap-1 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md shadow-sm shadow-indigo-500/25 cursor-pointer hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Optimize Bullets</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddExperience}
                className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperienceSection;
