import fs from 'fs';
import path from 'path';
import { extractResumeText, importResumeFile } from './src/services/resumeImportService.js';

async function audit() {
  try {
    const pdfPath = path.resolve('real-resume.pdf');
    if (!fs.existsSync(pdfPath)) {
      console.error("Error: real-resume.pdf not found at " + pdfPath);
      process.exit(1);
    }
    
    console.log("=== STAGE 1: READ PDF ===");
    const buffer = fs.readFileSync(pdfPath);
    console.log(`Buffer size: ${buffer.length} bytes`);
    
    console.log("\n=== STAGE 2: EXTRACT RESUME TEXT ===");
    const mockFile = {
      buffer: buffer,
      mimetype: 'application/pdf',
      originalname: 'real-resume.pdf'
    };
    
    const extractedText = await extractResumeText(mockFile);
    console.log(`Extracted Text Length: ${extractedText.length}`);
    console.log(`Contains [CAREERFORGE_METADATA_START]: ${extractedText.includes('[CAREERFORGE_METADATA_START]')}`);
    console.log(`Contains [CAREERFORGE_METADATA_END]: ${extractedText.includes('[CAREERFORGE_METADATA_END]')}`);
    
    // Log snippet around the metadata tags if they exist, or the end/beginning of text
    if (extractedText.includes('[CAREERFORGE_METADATA_START]')) {
      const idx = extractedText.indexOf('[CAREERFORGE_METADATA_START]');
      console.log("Found metadata start at index:", idx);
      console.log("Metadata start context:", extractedText.substring(idx, idx + 100));
    } else {
      console.log("Metadata start tag not found in text stream.");
      // Let's print the last 200 characters of the extracted text to see if anything is there
      console.log("Last 300 characters of extracted text:", extractedText.substring(extractedText.length - 300));
    }
    
    console.log("\n=== STAGE 3: REGEX MATCHING ===");
    const metadataRegex = /\[CAREERFORGE_METADATA_START\](.*?)\[CAREERFORGE_METADATA_END\]/s;
    const match = extractedText.match(metadataRegex);
    console.log("Regex returns match:", !!match);
    if (match) {
      console.log("Regex match length:", match[1].length);
      console.log("First 100 characters of match:", match[1].substring(0, 100));
      console.log("Last 100 characters of match:", match[1].substring(match[1].length - 100));
      
      console.log("\n=== STAGE 4: JSON PARSE ===");
      try {
        const parsedMetadata = JSON.parse(match[1].trim());
        console.log("JSON Parse: PASS");
        console.log("Keys in parsed object:", Object.keys(parsedMetadata));
        
        console.log("\n=== STAGE 5: NORMALIZE ===");
        const result = await importResumeFile(mockFile);
        console.log("Normalize: PASS");
        console.log("Normalized Resume data:", JSON.stringify(result.resume, null, 2).substring(0, 300) + "...");
      } catch (e) {
        console.log("JSON Parse / Normalize: FAIL");
        console.error(e);
      }
    }
  } catch (error) {
    console.error("Audit error:", error);
  }
}

audit();
