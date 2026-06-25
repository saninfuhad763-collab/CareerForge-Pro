const fs = require('fs');

const path = 'frontend/src/pages/Builder.jsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/<div>\s*<span className="font-bold text-slate-800 dark:text-slate-200">\{cert\.name \|\| 'Certification Name'\}<\/span>\s*<span className="text-slate-400 mx-1\.5">—<\/span>\s*<span className="text-slate-600 dark:text-slate-400">\{cert\.issuer\}<\/span>\s*<\/div>/g, 
`<div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{cert.name || 'Certification Name'}</span>
                                    <span className="text-slate-400">—</span>
                                    <span className="text-slate-600 dark:text-slate-400">{cert.issuer}</span>
                                    {cert.url && (
                                      <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                  </div>`);

fs.writeFileSync(path, c);
console.log('Builder.jsx cert preview updated!');
