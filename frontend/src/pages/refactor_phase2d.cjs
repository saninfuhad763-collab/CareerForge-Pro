const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Builder.jsx', 'utf8');

const importStr = "import CertificationsSection from '../components/CertificationsSection';\nimport LanguagesSection from '../components/LanguagesSection';\n";
c = c.replace("import ProjectsSection from '../components/ProjectsSection';", importStr + "import ProjectsSection from '../components/ProjectsSection';");

const startStr = "            {/* 7. CERTIFICATIONS */}";
const endStr = "            {/* 9. SECTION SORTING AND LAYOUT STRUCTURE WIDGET */}";

const s = c.indexOf(startStr);
const e = c.indexOf(endStr);

if (s !== -1 && e !== -1) {
  const rep = `            {/* 7. CERTIFICATIONS */}
            <CertificationsSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              certifications={certifications}
              handleRemoveCertification={handleRemoveCertification}
              handleUpdateCertification={handleUpdateCertification}
              handleAddCertification={handleAddCertification}
            />

            {/* 8. LANGUAGES */}
            <LanguagesSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              languages={languages}
              handleRemoveLanguage={handleRemoveLanguage}
              handleUpdateLanguage={handleUpdateLanguage}
              handleAddLanguage={handleAddLanguage}
            />

`;
  c = c.substring(0, s) + rep + c.substring(e);
  fs.writeFileSync('frontend/src/pages/Builder.jsx', c);
  console.log('Phase 2D Refactor applied successfully!');
} else {
  console.log('Markers not found: s=' + s + ' e=' + e);
}
