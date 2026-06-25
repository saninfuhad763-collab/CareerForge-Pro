import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronUp, ChevronDown } from 'lucide-react';

const PersonalSection = ({
  activeAccordion,
  toggleAccordion,
  personalInfo,
  handlePersonalInfoChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => toggleAccordion('personal')}
        className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-indigo-500" />
          <span>Personal Details</span>
        </div>
        {activeAccordion === 'personal' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
      </button>

      <AnimatePresence>
        {activeAccordion === 'personal' && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
          >
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={personalInfo.fullName || ''}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={personalInfo.title || ''}
                    onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={personalInfo.email || ''}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={personalInfo.phone || ''}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    value={personalInfo.location || ''}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Links & Portfolios</h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Website</label>
                    <input
                      type="text"
                      placeholder="portfolio.com"
                      value={personalInfo.website || ''}
                      onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">GitHub</label>
                    <input
                      type="text"
                      placeholder="github.com/user"
                      value={personalInfo.github || ''}
                      onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">LinkedIn</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/user"
                      value={personalInfo.linkedin || ''}
                      onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalSection;
