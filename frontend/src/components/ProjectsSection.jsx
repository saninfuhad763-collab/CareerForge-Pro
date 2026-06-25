import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

const ProjectsSection = ({
  activeAccordion,
  toggleAccordion,
  projects,
  handleRemoveProject,
  handleUpdateProject,
  handleAddProject,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => toggleAccordion('projects')}
        className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-4 h-4 text-indigo-500" />
          <span>Projects ({projects.length})</span>
        </div>
        {activeAccordion === 'projects' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
      </button>

      <AnimatePresence>
        {activeAccordion === 'projects' && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
          >
            <div className="p-5 space-y-6">
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRemoveProject(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Project #{idx + 1}</h6>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Project Name</label>
                      <input
                        type="text"
                        placeholder="E-Commerce API"
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Role/Scope</label>
                      <input
                        type="text"
                        placeholder="Solo Creator"
                        value={proj.role}
                        onChange={(e) => handleUpdateProject(idx, 'role', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-bold text-slate-400">Project URL</label>
                      <input
                        type="text"
                        placeholder="github.com/my-project"
                        value={proj.url}
                        onChange={(e) => handleUpdateProject(idx, 'url', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Date</label>
                      <input
                        type="text"
                        placeholder="2025"
                        value={proj.startDate}
                        onChange={(e) => handleUpdateProject(idx, 'startDate', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Project Description</label>
                    <textarea
                      rows={2.5}
                      placeholder="Built scalable auth pipelines utilizing Redis cache layer..."
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddProject}
                className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsSection;
