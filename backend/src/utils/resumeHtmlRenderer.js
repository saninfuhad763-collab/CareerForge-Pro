const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const DEFAULT_SECTION_ORDER = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
];

const sectionTitle = (templateId, title) => {
  if (templateId === 'modern') {
    return `<h2 class="section-title modern">${escapeHtml(title)}</h2>`;
  }
  if (templateId === 'minimalist') {
    return `<h2 class="section-title minimalist">${escapeHtml(title)}</h2>`;
  }
  return `<h2 class="section-title classic">${escapeHtml(title)}</h2>`;
};

const renderBullets = (description) => {
  if (!description) return '';
  const lines = description.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return '';
  return `<ul class="bullets">${lines
    .map((line) => `<li>${escapeHtml(line.replace(/^- /, ''))}</li>`)
    .join('')}</ul>`;
};

const renderHeader = (resume, templateId) => {
  const p = resume.personalInfo || {};
  const role = resume.personalInfo?.title || resume.experience?.[0]?.position || 'Target Professional Role';
  
  const formatLink = (url, label) => {
    if (!url) return null;
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${escapeHtml(href)}" style="text-decoration: none; color: inherit;">${escapeHtml(label)}</a>`;
  };

  const contactLinksHtml = [
    formatLink(p.website, 'Portfolio'),
    formatLink(p.github, 'GitHub'),
    formatLink(p.linkedin, 'LinkedIn'),
  ].filter(Boolean);

  if (templateId === 'modern') {
    return `
      <header class="header modern">
        <div class="header-left">
          <h1>${escapeHtml(p.fullName || 'YOUR FULL NAME')}</h1>
          <p class="role">${escapeHtml(role)}</p>
        </div>
        <div class="header-right">
          <p>${escapeHtml(p.email || 'email@address.com')}</p>
          <p>${escapeHtml(p.phone || '')}</p>
          <p>${escapeHtml(p.location || '')}</p>
          ${contactLinksHtml.map((linkHtml) => `<p>${linkHtml}</p>`).join('')}
        </div>
      </header>`;
  }

  if (templateId === 'minimalist') {
    const parts = [
      p.email ? escapeHtml(p.email) : null,
      p.phone ? escapeHtml(p.phone) : null,
      p.location ? escapeHtml(p.location) : null,
      ...contactLinksHtml,
    ].filter(Boolean);
    return `
      <header class="header minimalist">
        <h1>${escapeHtml(p.fullName || 'YOUR FULL NAME')}</h1>
        <p class="role">${escapeHtml(role)}</p>
        <p class="contact-line">${parts.join(' · ')}</p>
      </header>`;
  }

  const parts = [
    p.email ? escapeHtml(p.email) : null,
    p.phone ? escapeHtml(p.phone) : null,
    p.location ? escapeHtml(p.location) : null,
    ...contactLinksHtml,
  ].filter(Boolean);
  return `
    <header class="header classic">
      <h1>${escapeHtml(p.fullName || 'YOUR FULL NAME')}</h1>
      <p class="role">${escapeHtml(role)}</p>
      <p class="contact-line">${parts.join(' | ')}</p>
      <div class="classic-rule"></div>
    </header>`;
};

const renderSummary = (resume, templateId) => {
  if (!resume.summary) return '';
  return `
    <section class="section">
      ${sectionTitle(templateId, 'Professional Summary')}
      <p class="summary-text">${escapeHtml(resume.summary)}</p>
    </section>`;
};

const renderExperience = (resume, templateId) => {
  const items = resume.experience || [];
  if (items.length === 0) return '';

  const rows = items
    .map((exp) => {
      const dates = `${exp.startDate || 'Date'} — ${exp.current ? 'Present' : exp.endDate || 'Date'}`;
      if (templateId === 'classic') {
        return `
          <div class="entry classic-entry">
            <div class="entry-row">
              <span class="entry-primary">${escapeHtml(exp.company || 'Company')}</span>
              <span class="entry-meta">${escapeHtml(exp.location || '')}</span>
            </div>
            <div class="entry-row">
              <span class="entry-secondary">${escapeHtml(exp.position || 'Position')}</span>
              <span class="entry-date">${escapeHtml(dates)}</span>
            </div>
            ${renderBullets(exp.description)}
          </div>`;
      }
      if (templateId === 'minimalist') {
        return `
          <div class="entry">
            <div class="entry-row">
              <span class="entry-primary">${escapeHtml(exp.position || 'Position')} · ${escapeHtml(exp.company || 'Company')}</span>
              <span class="entry-date">${escapeHtml(dates)}</span>
            </div>
            ${exp.location ? `<p class="entry-location">${escapeHtml(exp.location)}</p>` : ''}
            ${renderBullets(exp.description)}
          </div>`;
      }
      return `
        <div class="entry">
          <div class="entry-row">
            <span class="entry-primary">${escapeHtml(exp.position || 'Position')} | ${escapeHtml(exp.company || 'Company')}</span>
            <span class="entry-date">${escapeHtml(dates)}</span>
          </div>
          ${exp.location ? `<p class="entry-location">${escapeHtml(exp.location)}</p>` : ''}
          ${renderBullets(exp.description)}
        </div>`;
    })
    .join('');

  return `
    <section class="section">
      ${sectionTitle(templateId, 'Professional Experience')}
      <div class="entry-list">${rows}</div>
    </section>`;
};

const renderEducation = (resume, templateId) => {
  const items = resume.education || [];
  if (items.length === 0) return '';

  const rows = items
    .map((edu) => {
      const dates = `${edu.startDate || 'Date'} — ${edu.endDate || 'Date'}`;
      if (templateId === 'classic') {
        return `
          <div class="entry classic-entry">
            <div class="entry-row">
              <span class="entry-primary">${escapeHtml(edu.school || 'School')}</span>
              <span class="entry-meta">${escapeHtml(edu.location || '')}</span>
            </div>
            <div class="entry-row">
              <span class="entry-secondary">${escapeHtml(edu.degree || 'Degree')}</span>
              <span class="entry-date">${escapeHtml(dates)}</span>
            </div>
          </div>`;
      }
      return `
        <div class="entry">
          <div class="entry-row">
            <span class="entry-primary">${escapeHtml(edu.degree || 'Degree')} · ${escapeHtml(edu.school || 'School')}</span>
            <span class="entry-date">${escapeHtml(dates)}</span>
          </div>
        </div>`;
    })
    .join('');

  return `
    <section class="section">
      ${sectionTitle(templateId, 'Education')}
      <div class="entry-list">${rows}</div>
    </section>`;
};

const renderSkills = (resume, templateId) => {
  const items = resume.skills || [];
  if (items.length === 0) return '';

  const rows = items
    .map((skill) => {
      const keywords = (skill.keywords || []).filter(Boolean);
      if (templateId === 'modern') {
        return `
          <div class="skill-row">
            <span class="skill-name">${escapeHtml(skill.name || 'Skills')}:</span>
            <span class="skill-tags">${keywords.map((kw) => `<span class="tag">${escapeHtml(kw)}</span>`).join('')}</span>
          </div>`;
      }
      return `
        <div class="skill-row">
          <span class="skill-name">${escapeHtml(skill.name || 'Skills')}:</span>
          <span class="skill-inline">${keywords.map((kw) => escapeHtml(kw)).join(' · ')}</span>
        </div>`;
    })
    .join('');

  return `
    <section class="section">
      ${sectionTitle(templateId, 'Skills')}
      <div class="skills-list">${rows}</div>
    </section>`;
};

const renderProjects = (resume, templateId) => {
  const items = resume.projects || [];
  if (items.length === 0) return '';

  const formatProjectLink = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    const href = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;

    let domain = 'link';
    try {
      const parsed = new URL(href);
      domain = parsed.hostname.replace(/^www\./i, '');
    } catch (e) {
      const match = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?([^:\/\s]+)/i);
      if (match && match[1]) {
        domain = match[1];
      }
    }

    let categoryLabel = 'View Project';
    const lowercaseUrl = href.toLowerCase();
    if (lowercaseUrl.includes('github.com')) {
      categoryLabel = 'GitHub Repository';
    } else if (lowercaseUrl.includes('gitlab.com')) {
      categoryLabel = 'Git Repository';
    }

    const label = `${categoryLabel} (${domain})`;
    return `<a href="${escapeHtml(href)}" style="text-decoration: none; color: inherit;">${escapeHtml(label)}</a>`;
  };

  const rows = items
    .map((project) => {
      const cleanedDescription = project.description
        ? project.description
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .join('\n')
        : '';

      return `
        <div class="entry">
          <div class="entry-row">
            <span class="entry-primary">${escapeHtml(project.title || 'Project')}</span>
            <span class="entry-date">${escapeHtml(project.startDate || '')}</span>
          </div>
          ${(project.role || project.url) ? `
          <div class="entry-row">
            <span class="entry-secondary">${escapeHtml(project.role || '')}</span>
            ${project.url ? `<span class="entry-meta">${formatProjectLink(project.url)}</span>` : ''}
          </div>` : ''}
          ${cleanedDescription ? renderBullets(cleanedDescription) : ''}
        </div>`;
    })
    .join('');

  return `
    <section class="section">
      ${sectionTitle(templateId, 'Projects')}
      <div class="entry-list">${rows}</div>
    </section>`;
};

const renderCertifications = (resume, templateId) => {
  const items = resume.certifications || [];
  if (items.length === 0) return '';

  const rows = items
    .map((cert) => `
      <div class="entry">
        <div class="entry-row">
          <span class="entry-primary">${escapeHtml(cert.name || 'Certification')}</span>
          <span class="entry-date">${escapeHtml(cert.date || '')}</span>
        </div>
        ${(cert.issuer || cert.url) ? `
        <div class="entry-row">
          <span class="entry-secondary">${escapeHtml(cert.issuer || '')}</span>
          ${cert.url ? `<span class="entry-meta">${escapeHtml(cert.url)}</span>` : ''}
        </div>` : ''}
      </div>`)
    .join('');

  return `
    <section class="section">
      ${sectionTitle(templateId, 'Certifications')}
      <div class="entry-list">${rows}</div>
    </section>`;
};

const renderLanguages = (resume, templateId) => {
  const items = resume.languages || [];
  if (items.length === 0) return '';

  const rows = items
    .map((lang) => `
      <div class="entry-row">
        <span class="entry-primary">${escapeHtml(lang.language || 'Language')}</span>
        <span class="entry-date">${escapeHtml(lang.proficiency || '')}</span>
      </div>`)
    .join('');

  return `
    <section class="section">
      ${sectionTitle(templateId, 'Languages')}
      <div class="entry-list">${rows}</div>
    </section>`;
};

const SECTION_RENDERERS = {
  summary: renderSummary,
  experience: renderExperience,
  education: renderEducation,
  skills: renderSkills,
  projects: renderProjects,
  certifications: renderCertifications,
  languages: renderLanguages,
};

const buildMetadataPayload = (resume) => ({
  personalInfo: resume.personalInfo || {},
  summary: resume.summary || '',
  experience: resume.experience || [],
  education: resume.education || [],
  skills: resume.skills || [],
  certifications: resume.certifications || [],
  projects: resume.projects || [],
  languages: resume.languages || [],
});

const getStyles = (templateId) => `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ${templateId === 'classic' ? 'Georgia, "Times New Roman", serif' : 'Inter, Arial, sans-serif'};
    color: #0f172a;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sheet {
    width: 100%;
    padding: 0;
    position: relative;
  }
  .accent-bar {
    height: 4px;
    width: 100%;
    margin-bottom: 24px;
    background: ${
      templateId === 'modern'
        ? 'linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)'
        : templateId === 'minimalist'
          ? 'linear-gradient(90deg, #cbd5e1, #94a3b8)'
          : '#0f172a'
    };
  }
  .header { margin-bottom: 20px; }
  .header.modern {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 18px;
  }
  .header h1 { font-size: 28px; font-weight: 800; line-height: 1.1; }
  .header .role {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #4f46e5;
  }
  .header-right { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
  .header.minimalist h1 {
    font-size: 24px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .header.minimalist .role {
    margin-top: 4px;
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }
  .contact-line { margin-top: 10px; font-size: 10px; color: #64748b; }
  .header.classic { text-align: center; }
  .header.classic h1 { font-size: 30px; font-weight: 700; }
  .header.classic .role {
    margin-top: 6px;
    font-size: 11px;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #475569;
  }
  .classic-rule {
    margin-top: 14px;
    border-bottom: 2px solid #0f172a;
    width: 100%;
  }
  .section { margin-top: 18px; page-break-inside: avoid; }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 8px;
  }
  .section-title.modern {
    color: #4f46e5;
    border-left: 4px solid #6366f1;
    padding-left: 10px;
  }
  .section-title.minimalist {
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
  }
  .section-title.classic {
    color: #0f172a;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 4px;
  }
  .summary-text { font-size: 11px; line-height: 1.55; color: #475569; }
  .entry-list { display: flex; flex-direction: column; gap: 10px; }
  .entry-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
  }
  .entry-primary { font-weight: 700; color: #0f172a; }
  .entry-secondary { font-size: 11px; color: #475569; font-style: ${templateId === 'classic' ? 'italic' : 'normal'}; }
  .entry-meta, .entry-date, .entry-location {
    font-size: 10px;
    color: #64748b;
    white-space: nowrap;
  }
  .entry-location { margin-top: 2px; }
  .bullets {
    margin-top: 4px;
    padding-left: 16px;
    font-size: 11px;
    color: #475569;
    line-height: 1.45;
  }
  .bullets li { margin-bottom: 2px; }
  .skills-list { display: flex; flex-direction: column; gap: 6px; }
  .skill-row { display: flex; gap: 8px; font-size: 11px; align-items: flex-start; }
  .skill-name { min-width: 110px; font-weight: 700; color: #334155; }
  .skill-inline { color: #475569; }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    border: 1px solid #c7d2fe;
    font-size: 10px;
    font-weight: 500;
  }
  .metadata-hidden {
    position: absolute;
    left: -9999px;
    top: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    opacity: 0;
    font-size: 1px;
    line-height: 1px;
    color: transparent;
  }
`;

export const renderResumeHtml = (resume) => {
  const templateId = resume.templateId || 'modern';
  const sectionOrder = resume.sectionOrder?.length ? resume.sectionOrder : DEFAULT_SECTION_ORDER;

  const sectionsHtml = sectionOrder
    .map((sectionName) => {
      const renderer = SECTION_RENDERERS[sectionName];
      return renderer ? renderer(resume, templateId) : '';
    })
    .join('');

  const metadata = JSON.stringify(buildMetadataPayload(resume));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(resume.title || 'Resume')}</title>
  <style>${getStyles(templateId)}</style>
</head>
<body>
  <div class="sheet">
    <div class="accent-bar"></div>
    ${renderHeader(resume, templateId)}
    ${sectionsHtml}
    <div class="metadata-hidden">[CAREERFORGE_METADATA_START]${metadata}[CAREERFORGE_METADATA_END]</div>
  </div>
</body>
</html>`;
};
