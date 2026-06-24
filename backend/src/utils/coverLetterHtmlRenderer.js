const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const toParagraphs = (text) => {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => block.split('\n').map((line) => line.trim()).filter(Boolean));
};

export const renderCoverLetterHtml = (coverLetterDoc) => {
  const companyName = coverLetterDoc.companyName || 'Company';
  const jobTitle = coverLetterDoc.jobTitle || 'Position';
  const bodyLines = toParagraphs(coverLetterDoc.coverLetter || '');

  const bodyHtml = bodyLines.length > 0
    ? bodyLines.map((line) => `<p class="body-line">${escapeHtml(line)}</p>`).join('')
    : '<p class="body-line">&nbsp;</p>';

  const generatedDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(companyName)} — Cover Letter</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      width: 100%;
      max-width: 100%;
    }
    .accent-bar {
      height: 4px;
      width: 100%;
      margin-bottom: 28px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #10b981);
    }
    .meta {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .meta strong {
      color: #334155;
      font-weight: 700;
    }
    .body-line {
      font-size: 12px;
      line-height: 1.75;
      color: #334155;
      margin-bottom: 14px;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="accent-bar"></div>
    <div class="meta">
      <div>${escapeHtml(generatedDate)}</div>
      <div style="margin-top: 8px;">
        <strong>${escapeHtml(companyName)}</strong><br />
        Re: ${escapeHtml(jobTitle)}
      </div>
    </div>
    <div class="letter-body">
      ${bodyHtml}
    </div>
  </div>
</body>
</html>`;
};
