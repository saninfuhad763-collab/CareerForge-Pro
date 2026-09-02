import fs from 'fs';
import puppeteer from 'puppeteer';
import { renderCoverLetterHtml } from '../utils/coverLetterHtmlRenderer.js';

let browserInstance = null;

const resolveChromeExecutable = () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    if (fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    console.warn(
      `[Cover Letter PDF Service] PUPPETEER_EXECUTABLE_PATH is set to "${process.env.PUPPETEER_EXECUTABLE_PATH}" but file does not exist. Falling back to default Puppeteer browser.`
    );
  }

  return undefined;
};

const getBrowser = async () => {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  const executablePath = resolveChromeExecutable();
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  browserInstance = await puppeteer.launch(launchOptions);

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
