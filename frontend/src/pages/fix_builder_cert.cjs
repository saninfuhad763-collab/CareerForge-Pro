const fs = require('fs');

const path = 'frontend/src/pages/Builder.jsx';
let c = fs.readFileSync(path, 'utf8');

// Replace the modern certification div with the new flex one
const targetStr = `                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{cert.name || 'Certification Name'}</span>
                                    <span className="text-slate-400 mx-1.5">—</span>
                                    <span className="text-slate-600 dark:text-slate-400">{cert.issuer}</span>
                                  </div>`;

const repStr = `                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{cert.name || 'Certification Name'}</span>
                                    <span className="text-slate-400">—</span>
                                    <span className="text-slate-600 dark:text-slate-400">{cert.issuer}</span>
                                    {cert.url && (
                                      <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                  </div>`;

if (c.includes(targetStr)) {
  c = c.replace(targetStr, repStr);
  fs.writeFileSync(path, c);
  console.log('Builder.jsx updated successfully!');
} else {
  console.log('Target string not found in Builder.jsx');
}
