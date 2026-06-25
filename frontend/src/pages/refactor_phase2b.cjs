const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Builder.jsx', 'utf8');

const importStr = "import ExperienceSection from '../components/ExperienceSection';\nimport EducationSection from '../components/EducationSection';\n";
c = c.replace("import SummarySection from '../components/SummarySection';", importStr + "import SummarySection from '../components/SummarySection';");

const startStr = "            {/* 3. WORK EXPERIENCE */}";
const endStr = "            {/* 5. TECHNICAL SKILLS */}";

const s = c.indexOf(startStr);
const e = c.indexOf(endStr);

if (s !== -1 && e !== -1) {
  const rep = `            {/* 3. WORK EXPERIENCE */}
            <ExperienceSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              experience={experience}
              handleRemoveExperience={handleRemoveExperience}
              handleUpdateExperience={handleUpdateExperience}
              openMagicOptimizer={openMagicOptimizer}
              handleAddExperience={handleAddExperience}
            />

            {/* 4. EDUCATION */}
            <EducationSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              education={education}
              handleRemoveEducation={handleRemoveEducation}
              handleUpdateEducation={handleUpdateEducation}
              handleAddEducation={handleAddEducation}
            />

`;
  c = c.substring(0, s) + rep + c.substring(e);
  fs.writeFileSync('frontend/src/pages/Builder.jsx', c);
  console.log('Phase 2B Refactor applied successfully!');
} else {
  console.log('Markers not found: s=' + s + ' e=' + e);
}
