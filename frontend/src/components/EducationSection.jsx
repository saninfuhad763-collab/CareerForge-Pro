import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

const EducationSection = ({
  activeAccordion,
  toggleAccordion,
  education,
  handleRemoveEducation,
  handleUpdateEducation,
  handleAddEducation,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => toggleAccordion('education')}
        className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>Education ({education.length})</span>
        </div>
        {activeAccordion === 'education' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
      </button>

      <AnimatePresence>
        {activeAccordion === 'education' && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
          >
            <div className="p-5 space-y-6">
              {education.map((edu, idx) => (
                <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRemoveEducation(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">School #{idx + 1}</h6>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">School/University</label>
                      <input
                        type="text"
                        placeholder="Stanford"
                        value={edu.school}
                        onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Degree & Major</label>
                      <input
                        type="text"
                        placeholder="B.S. Computer Science"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Location</label>
                      <input
                        type="text"
                        placeholder="Stanford, CA"
                        value={edu.location}
                        onChange={(e) => handleUpdateEducation(idx, 'location', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Start Year</label>
                      <input
                        type="text"
                        placeholder="2020"
                        value={edu.startDate}
                        onChange={(e) => handleUpdateEducation(idx, 'startDate', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">End Year</label>
                      <input
                        type="text"
                        placeholder="2024"
                        value={edu.endDate}
                        onChange={(e) => handleUpdateEducation(idx, 'endDate', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddEducation}
                className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationSection;
