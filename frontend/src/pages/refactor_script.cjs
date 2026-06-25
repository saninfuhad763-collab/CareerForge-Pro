const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Builder.jsx', 'utf8');

const importStr = "import UploadResumeModal from '../components/UploadResumeModal';\nimport MagicOptimizerModal from '../components/MagicOptimizerModal';\nimport ATSReportModal from '../components/ATSReportModal';\n";

c = c.replace("import { useEffect, useState, useMemo } from 'react';", "import { useEffect, useState, useMemo } from 'react';\n" + importStr);

const startStr = "      {/* Upload Existing Resume Dialog Overlay */}";
const s = c.indexOf(startStr);
const endStr = "    </motion.div>";
const e = c.lastIndexOf(endStr);

if (s !== -1 && e !== -1) {
  const rep = `      {/* Upload Existing Resume Dialog Overlay */}
      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        isImportingResume={isImportingResume}
        selectedResumeFile={selectedResumeFile}
        uploadError={uploadError}
        uploadSuccess={uploadSuccess}
        handleResumeFileChange={handleResumeFileChange}
        handleResumeImport={handleResumeImport}
      />

      {/* Dynamic Streaming AI Magic Optimizer Dialog Overlay */}
      <MagicOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        magicPromptType={magicPromptType}
        setMagicPromptType={setMagicPromptType}
        targetKeyword={targetKeyword}
        setTargetKeyword={setTargetKeyword}
        originalText={originalText}
        optimizedText={optimizedText}
        isOptimizing={isOptimizing}
        planStats={planStats}
        historyLogs={historyLogs}
        cancelOptimization={cancelOptimization}
        startStreamOptimization={startStreamOptimization}
        applySuggestion={applySuggestion}
        rollbackSuggestion={rollbackSuggestion}
      />

      {/* ATS Score Breakdown detailed report modal */}
      <ATSReportModal
        isOpen={showAtsReportModal}
        onClose={() => setShowAtsReportModal(false)}
        safeAtsMetadata={safeAtsMetadata}
        dynamicAtsData={dynamicAtsData}
        modalKeywordSearch={modalKeywordSearch}
        setModalKeywordSearch={setModalKeywordSearch}
        openMagicOptimizer={openMagicOptimizer}
      />
`;
  c = c.substring(0, s) + rep + c.substring(e);
  fs.writeFileSync('frontend/src/pages/Builder.jsx', c);
  console.log('Replaced successfully!');
} else {
  console.log('Markers not found: s=' + s + ' e=' + e);
}
