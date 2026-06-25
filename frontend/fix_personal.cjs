const fs = require('fs');
const path = 'frontend/src/components/PersonalSection.jsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  /<div className="p-5 space-y-4">[\s\S]*?<div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800\/80">/,
`<div className="p-5 space-y-4">
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

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">`
);

fs.writeFileSync(path, c);
console.log("Updated PersonalSection.jsx");
