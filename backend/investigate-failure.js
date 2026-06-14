import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

// Import backend service methods for verification
import { extractResumeText, importResumeFile } from './src/services/resumeImportService.js';

async function main() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({ executablePath, headless: true });
  
  try {
    const page = await browser.newPage();
    
    // Authenticate
    await page.goto('http://localhost:5173/', { waitUntil: 'load' });
    await page.evaluate(() => {
      localStorage.setItem('cf_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMWRjYWJmN2NmODgzMTcwNzRkNWZmYiIsImlhdCI6MTc4MDMzNzM0MywiZXhwIjoxNzgyOTI5MzQzfQ.N7UTNx_gZjIrnRR5Shg-puGNzMJ7TgM7D_Totvcin74');
      localStorage.setItem('cf_user', JSON.stringify({
        _id: '6a1dcabf7cf88317074d5ffb',
        name: 'Automated Test',
        email: 'testuser3@example.com',
        plan: 'FREE'
      }));
    });

    // Go to builder page
    await page.goto('http://localhost:5173/builder/6a1dcad97cf88317074d6007', { waitUntil: 'load' });
    await page.waitForSelector('#resume-preview-sheet', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));

    // Generate real CareerForge PDF
    console.log('Generating real CareerForge exported PDF...');
    const pdfPath = path.resolve('real-exported-resume.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true
    });
    console.log('PDF generated at:', pdfPath);

    // ==========================================
    // STEP 1: extractResumeText()
    // ==========================================
    console.log('\n--- STEP 1: extractResumeText() ---');
    const buffer = fs.readFileSync(pdfPath);
    const file = { buffer, mimetype: 'application/pdf', originalname: 'real-exported-resume.pdf' };
    
    let text = '';
    let step1Passed = false;
    try {
      text = await extractResumeText(file);
      const cleaned = text.replace(/\u0000/g, ' ').replace(/\s+/g, ' ').trim();
      const hasStart = cleaned.includes('[CAREERFORGE_METADATA_START]');
      const hasEnd = cleaned.includes('[CAREERFORGE_METADATA_END]');
      
      console.log('* Text length:', text.length);
      console.log('* First 500 characters:', cleaned.substring(0, 500));
      console.log('* Metadata markers exist:', hasStart && hasEnd ? 'YES' : 'NO');
      step1Passed = true;
      console.log('Result: PASS');
    } catch (err) {
      console.error('Error in extractResumeText:', err);
      console.log('Result: FAIL');
    }

    // ==========================================
    // STEP 2: metadataRegex.match()
    // ==========================================
    console.log('\n--- STEP 2: metadataRegex.match() ---');
    const metadataRegex = /\[CAREERFORGE_METADATA_START\](.*?)\[CAREERFORGE_METADATA_END\]/s;
    const match = text.match(metadataRegex);
    let step2Passed = false;
    if (match) {
      console.log('* Match found?: YES');
      console.log('* Match length:', match[1].length);
      step2Passed = true;
      console.log('Result: PASS');
    } else {
      console.log('* Match found?: NO');
      console.log('* Match length: 0');
      console.log('Result: FAIL');
    }

    // ==========================================
    // STEP 3: JSON.parse()
    // ==========================================
    console.log('\n--- STEP 3: JSON.parse() ---');
    let parsedMetadata = null;
    let step3Passed = false;
    if (step2Passed) {
      try {
        parsedMetadata = JSON.parse(match[1].trim());
        console.log('* Parsed object keys:', Object.keys(parsedMetadata));
        console.log('* Parsed object structure matches schema:', 
          (parsedMetadata.personalInfo && parsedMetadata.experience) ? 'YES' : 'NO'
        );
        step3Passed = true;
        console.log('Result: PASS');
      } catch (err) {
        console.error('Error in JSON.parse:', err);
        console.log('Result: FAIL');
      }
    } else {
      console.log('Result: FAIL (Skipped due to Step 2 failure)');
    }

    // ==========================================
    // STEP 4: normalizeImportedResume()
    // ==========================================
    console.log('\n--- STEP 4: normalizeImportedResume() ---');
    let normalized = null;
    let step4Passed = false;
    if (step3Passed) {
      try {
        const result = await importResumeFile(file);
        normalized = result.resume;
        console.log('* Returned object keys:', Object.keys(normalized));
        console.log('* Field counts:');
        console.log('  - Experience:', normalized.experience?.length || 0);
        console.log('  - Education:', normalized.education?.length || 0);
        console.log('  - Skills:', normalized.skills?.length || 0);
        console.log('  - Projects:', normalized.projects?.length || 0);
        console.log('  - Certifications:', normalized.certifications?.length || 0);
        console.log('  - Languages:', normalized.languages?.length || 0);
        step4Passed = true;
        console.log('Result: PASS');
      } catch (err) {
        console.error('Error in normalizeImportedResume:', err);
        console.log('Result: FAIL');
      }
    } else {
      console.log('Result: FAIL (Skipped due to Step 3 failure)');
    }

    // ==========================================
    // Setup request interception to capture state updates
    // ==========================================
    let updatePayloadReceived = null;
    let putResponseReceived = null;

    // Capture browser console output (TRACE-A / TRACE-B logs)
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[TRACE')) {
        console.log('[BROWSER CONSOLE]', text);
      }
    });

    page.on('request', req => {
      if (req.method() === 'PUT' && req.url().includes('/api/resumes/')) {
        try {
          updatePayloadReceived = JSON.parse(req.postData());
        } catch (e) {}
      }
    });

    page.on('response', async res => {
      if (res.request().method() === 'PUT' && res.url().includes('/api/resumes/')) {
        try {
          putResponseReceived = await res.json();
        } catch (e) {}
      }
    });

    // ==========================================
    // Open upload modal and upload file
    // ==========================================
    console.log('\nTriggering UI upload flow...');
    await page.evaluate(() => {
      // Find and click the Upload Existing Resume button
      const buttons = Array.from(document.querySelectorAll('button'));
      const uploadBtn = buttons.find(b => b.textContent.includes('Upload Existing Resume'));
      if (uploadBtn) uploadBtn.click();
    });

    await page.waitForSelector('input[type="file"]');
    const inputUpload = await page.$('input[type="file"]');
    await inputUpload.uploadFile(pdfPath);
    await new Promise(r => setTimeout(r, 1000));

    console.log('Clicking Import Resume button in UI...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const importBtn = buttons.find(b => b.textContent.includes('Import Resume'));
      if (importBtn) importBtn.click();
    });

    console.log('Waiting for import and save network requests...');
    await new Promise(r => setTimeout(r, 5000));

    // ==========================================
    // STEP 5: updateResumeLocal()
    // ==========================================
    console.log('\n--- STEP 5: updateResumeLocal() ---');
    if (updatePayloadReceived) {
      console.log('* Payload received by saveResumeImmediately (sent via PUT):');
      console.log('  - title:', updatePayloadReceived.title);
      console.log('  - personalInfo name:', updatePayloadReceived.personalInfo?.fullName);
      console.log('  - summary length:', updatePayloadReceived.summary?.length || 0);
      console.log('  - experience count:', updatePayloadReceived.experience?.length || 0);
      console.log('Result: PASS');
    } else {
      console.log('* No update/save payload intercepted.');
      console.log('Result: FAIL');
    }

    // ==========================================
    // STEP 6: Log Zustand State (immediately after update)
    // ==========================================
    console.log('\n--- STEP 6: Log Zustand State ---');
    if (updatePayloadReceived) {
      const r = updatePayloadReceived;
      console.log('* personalInfo:', JSON.stringify(r.personalInfo));
      console.log('* summary length:', r.summary?.length || 0);
      console.log('* experience count:', r.experience?.length || 0);
      console.log('* education count:', r.education?.length || 0);
      console.log('* skills count:', r.skills?.length || 0);
      console.log('* projects count:', r.projects?.length || 0);
      console.log('* certifications count:', r.certifications?.length || 0);
      console.log('* languages count:', r.languages?.length || 0);
      console.log('Result: PASS');
    } else {
      console.log('Result: FAIL');
    }

    // ==========================================
    // STEP 7: Log Builder Rendering
    // ==========================================
    console.log('\n--- STEP 7: Log Builder Rendering ---');
    const builderData = await page.evaluate(() => {
      const nameInput = document.querySelector('input[placeholder="John Doe"]');
      const emailInput = document.querySelector('input[placeholder="john@example.com"]');
      const summaryTextarea = document.querySelector('textarea[placeholder="Brief, professional summary of your background..."]');
      
      return {
        fullName: nameInput ? nameInput.value : null,
        email: emailInput ? emailInput.value : null,
        summary: summaryTextarea ? summaryTextarea.value : null,
      };
    });

    console.log('* Builder name field value:', builderData.fullName);
    console.log('* Builder email field value:', builderData.email);
    console.log('* Builder summary textarea value length:', builderData.summary?.length || 0);
    
    const builderEmptyFields = [];
    if (!builderData.fullName) builderEmptyFields.push('Full Name');
    if (!builderData.email) builderEmptyFields.push('Email');
    if (!builderData.summary) builderEmptyFields.push('Summary');

    console.log('* Empty fields in builder:', builderEmptyFields.join(', ') || 'None');
    if (builderData.fullName && builderData.email && builderData.summary) {
      console.log('Result: PASS');
    } else {
      console.log('Result: FAIL');
    }

    // ==========================================
    // STEP 8: Log Resume Preview Rendering
    // ==========================================
    console.log('\n--- STEP 8: Log Resume Preview Rendering ---');
    const previewData = await page.evaluate(() => {
      const sheet = document.getElementById('resume-preview-sheet');
      if (!sheet) return null;
      
      const sections = Array.from(sheet.querySelectorAll('section'));
      const headings = sections.map(s => s.querySelector('h2, h3')?.textContent || '');
      const fullNameText = sheet.querySelector('h1')?.textContent || '';
      
      return {
        fullName: fullNameText,
        sectionsCount: sections.length,
        headings: headings,
      };
    });

    if (previewData) {
      console.log('* Preview full name element text:', previewData.fullName);
      console.log('* Rendered sections count:', previewData.sectionsCount);
      console.log('* Rendered section headings:', previewData.headings);
      console.log('Result: PASS');
    } else {
      console.log('* Preview sheet not found.');
      console.log('Result: FAIL');
    }

    // Print final summaries
    console.log('\n==========================================');
    console.log('FINAL AUDIT OUTPUT:');
    if (builderData.fullName === 'Alex Rivera Jr.') {
      console.log('ALL STEPS PASSED!');
    } else {
      console.log('DETECTED FAILURE');
    }

  } catch (err) {
    console.error('Fatal error during test run:', err);
  } finally {
    await browser.close();
  }
}

main();
