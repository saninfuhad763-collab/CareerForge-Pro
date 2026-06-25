const fs = require('fs');

const pathB = 'frontend/src/pages/Builder.jsx';
let cB = fs.readFileSync(pathB, 'utf8');

cB = cB.replace(
  /\{experience\[0\]\?\.position \|\| 'Target Professional Role'\}/g,
  "{personalInfo.title || experience[0]?.position || 'Target Professional Role'}"
);
fs.writeFileSync(pathB, cB);
console.log("Updated Builder.jsx");

const pathR = 'backend/src/utils/resumeHtmlRenderer.js';
let cR = fs.readFileSync(pathR, 'utf8');

cR = cR.replace(
  "const role = resume.experience?.[0]?.position || 'Target Professional Role';",
  "const role = resume.personalInfo?.title || resume.experience?.[0]?.position || 'Target Professional Role';"
);
fs.writeFileSync(pathR, cR);
console.log("Updated resumeHtmlRenderer.js");
