import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

const SkillsSection = ({
  activeAccordion,
  toggleAccordion,
  skills,
  localSkillsText,
  handleRemoveSkillCategory,
  handleUpdateSkillCategory,
  handleAddSkillCategory,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => toggleAccordion('skills')}
        className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Wrench className="w-4 h-4 text-indigo-500" />
          <span>Skills ({skills.length})</span>
        </div>
        {activeAccordion === 'skills' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
      </button>

      <AnimatePresence>
        {activeAccordion === 'skills' && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
          >
            <div className="p-5 space-y-6">
              {skills.map((skill, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRemoveSkillCategory(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Skill Group #{idx + 1}</h6>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Group Name</label>
                      <input
                        type="text"
                        placeholder="Languages"
                        value={skill.name}
                        onChange={(e) => handleUpdateSkillCategory(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Proficiency Level (Optional)</label>
                      <input
                        type="text"
                        placeholder="Expert"
                        value={skill.level}
                        onChange={(e) => handleUpdateSkillCategory(idx, 'level', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="React, JavaScript, HTML, CSS"
                      value={localSkillsText[idx] !== undefined ? localSkillsText[idx] : (skill.keywords ? skill.keywords.join(', ') : '')}
                      onChange={(e) => handleUpdateSkillCategory(idx, 'keywords', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                    <p className="text-[9px] text-slate-400">Separate keywords with commas. Essential for ATS matching filters.</p>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSkillCategory}
                className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Skill Group
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillsSection;
