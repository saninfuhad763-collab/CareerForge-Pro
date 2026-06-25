const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Builder.jsx', 'utf8');

const importStr = "import SkillsSection from '../components/SkillsSection';\nimport ProjectsSection from '../components/ProjectsSection';\n";
c = c.replace("import EducationSection from '../components/EducationSection';", importStr + "import EducationSection from '../components/EducationSection';");

const startStr = "            {/* 5. TECHNICAL SKILLS */}";
const endStr = "            {/* 7. CERTIFICATIONS */}";

const s = c.indexOf(startStr);
const e = c.indexOf(endStr);

if (s !== -1 && e !== -1) {
  const rep = `            {/* 5. TECHNICAL SKILLS */}
            <SkillsSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              skills={skills}
              localSkillsText={localSkillsText}
              handleRemoveSkillCategory={handleRemoveSkillCategory}
              handleUpdateSkillCategory={handleUpdateSkillCategory}
              handleAddSkillCategory={handleAddSkillCategory}
            />

            {/* 6. PROJECTS */}
            <ProjectsSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              projects={projects}
              handleRemoveProject={handleRemoveProject}
              handleUpdateProject={handleUpdateProject}
              handleAddProject={handleAddProject}
            />

`;
  c = c.substring(0, s) + rep + c.substring(e);
  fs.writeFileSync('frontend/src/pages/Builder.jsx', c);
  console.log('Phase 2C Refactor applied successfully!');
} else {
  console.log('Markers not found: s=' + s + ' e=' + e);
}
