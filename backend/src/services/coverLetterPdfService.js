import fs from 'fs';
import puppeteer from 'puppeteer-core';
import { renderCoverLetterHtml } from '../utils/coverLetterHtmlRenderer.js';

let browserInstance = null;

const resolveChromeExecutable = () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Chrome/Chromium executable not found. Set PUPPETEER_EXECUTABLE_PATH in your environment.'
  );
};

const getBrowser = async () => {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  browserInstance = await puppeteer.launch({
    executablePath: resolveChromeExecutable(),
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  return browserInstance;
};

export const generateCoverLetterPdf = async (coverLetterDoc) => {
  const html = renderCoverLetterHtml(coverLetterDoc);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
      preferCSSPageSize: false,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
};

export const closeCoverLetterPdfBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};

process.on('SIGTERM', () => {
  closeCoverLetterPdfBrowser().catch(() => {});
});
