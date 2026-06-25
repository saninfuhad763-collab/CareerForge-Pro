const fs = require('fs');
const path = 'backend/src/models/Resume.js';
let c = fs.readFileSync(path, 'utf8');

if (!c.includes("  title: { type: String, default: '' }, // added professional title")) {
  c = c.replace(
    "fullName: { type: String, default: '' },",
    "fullName: { type: String, default: '' },\n  title: { type: String, default: '' }, // added professional title"
  );
  fs.writeFileSync(path, c);
  console.log("Added title to personalInfoSchema in Resume.js");
} else {
  console.log("title already exists in personalInfoSchema");
}
