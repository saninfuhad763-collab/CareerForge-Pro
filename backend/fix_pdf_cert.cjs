const fs = require('fs');

const path = 'backend/src/utils/resumeHtmlRenderer.js';
let c = fs.readFileSync(path, 'utf8');

const targetStr = `      <div class="entry">
        <div class="entry-row">
          <span class="entry-primary">\${escapeHtml(cert.name || 'Certification')}</span>
          <span class="entry-date">\${escapeHtml(cert.date || '')}</span>
        </div>
        \${cert.issuer ? \`<p class="entry-secondary">\${escapeHtml(cert.issuer)}</p>\` : ''}
      </div>\`)`;

// wait! let's use regex to handle line endings.

c = c.replace(/<div class="entry">\s*<div class="entry-row">\s*<span class="entry-primary">\$\{escapeHtml\(cert\.name \|\| 'Certification'\)\}<\/span>\s*<span class="entry-date">\$\{escapeHtml\(cert\.date \|\| ''\)\}<\/span>\s*<\/div>\s*\$\{cert\.issuer \? `<p class="entry-secondary">\$\{escapeHtml\(cert\.issuer\)\}<\/p>` : ''\}\s*<\/div>`\)/g, 
`<div class="entry">
        <div class="entry-row">
          <span class="entry-primary">\${escapeHtml(cert.name || 'Certification')}</span>
          \${cert.url ? \`<span class="entry-meta">\${escapeHtml(cert.url)}</span>\` : ''}
        </div>
        \${cert.issuer ? \`<p class="entry-secondary">\${escapeHtml(cert.issuer)}</p>\` : ''}
        \${cert.date ? \`<p class="entry-meta" style="margin-top: 2px;">\${escapeHtml(cert.date)}</p>\` : ''}
      </div>\`)`);

fs.writeFileSync(path, c);
console.log('PDF Renderer updated!');
