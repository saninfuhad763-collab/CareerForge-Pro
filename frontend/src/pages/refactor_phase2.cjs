const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Builder.jsx', 'utf8');

const importStr = "import PersonalSection from '../components/PersonalSection';\nimport SummarySection from '../components/SummarySection';\n";
c = c.replace("import UploadResumeModal from '../components/UploadResumeModal';", importStr + "import UploadResumeModal from '../components/UploadResumeModal';");

const startStr = "            {/* 1. PERSONAL INFORMATION */}";
const endStr = "            {/* 3. WORK EXPERIENCE */}";

const s = c.indexOf(startStr);
const e = c.indexOf(endStr);

if (s !== -1 && e !== -1) {
  const rep = `            {/* 1. PERSONAL INFORMATION */}
            <PersonalSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              personalInfo={personalInfo}
              handlePersonalInfoChange={handlePersonalInfoChange}
            />

            {/* 2. PROFESSIONAL SUMMARY */}
            <SummarySection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              summary={summary}
              handleSummaryChange={handleSummaryChange}
              openMagicOptimizer={openMagicOptimizer}
            />

`;
  c = c.substring(0, s) + rep + c.substring(e);
  fs.writeFileSync('frontend/src/pages/Builder.jsx', c);
  console.log('Phase 2 Refactor applied successfully!');
} else {
  console.log('Markers not found: s=' + s + ' e=' + e);
}
