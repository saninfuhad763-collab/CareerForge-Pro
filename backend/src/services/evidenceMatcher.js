/**
 * Section-Aware Evidence Matcher Service
 *
 * Evaluates candidate qualifications against canonical requirements with
 * precise sectional provenance, exact/alias/partial classification, and
 * auditable evidence snippets.
 *
 * Part of CareerForge Pro ATS Phase 2A Hardening.
 */

import { checkTermMatch } from './canonicalTaxonomy.js';

/**
 * Section priority order: stronger professional demonstration sections first
 */
const SECTION_PRIORITY = [
  'experience',
  'projects',
  'skills',
  'summary',
  'education',
  'certifications',
  'languages',
  'customSections',
];

/**
 * Converts a structured Resume object into section-aware item records.
 * Explicitly omits personal contact details (email, phone, address).
 */
export function buildStructuredResumeSections(resume) {
  if (!resume || typeof resume !== 'object') return [];

  const sections = [];

  // 1. Professional Summary
  if (typeof resume.summary === 'string' && resume.summary.trim()) {
    sections.push({
      section: 'summary',
      label: 'Professional Summary',
      itemIndex: 0,
      context: 'Professional Summary',
      text: resume.summary.trim(),
    });
  }

  // 2. Work Experience (bullet & description items)
  if (Array.isArray(resume.experience)) {
    resume.experience.forEach((exp, idx) => {
      const position = exp.position || '';
      const company = exp.company || '';
      const context = [position, company].filter(Boolean).join(' at ') || `Experience #${idx + 1}`;
      const text = [position, company, exp.description || ''].filter(Boolean).join(' ');
      if (text.trim()) {
        sections.push({
          section: 'experience',
          label: 'Work Experience',
          itemIndex: idx,
          context,
          text: text.trim(),
        });
      }
    });
  }

  // 3. Skills (grouped category & keyword items)
  if (Array.isArray(resume.skills)) {
    resume.skills.forEach((s, idx) => {
      const catName = s.name || '';
      const kwList = Array.isArray(s.keywords) ? s.keywords.join(', ') : '';
      const context = catName ? `Skills (${catName})` : `Skills #${idx + 1}`;
      const text = [catName, kwList].filter(Boolean).join(': ');
      if (text.trim()) {
        sections.push({
          section: 'skills',
          label: 'Skills',
          itemIndex: idx,
          context,
          text: text.trim(),
          keywords: Array.isArray(s.keywords) ? s.keywords : [],
        });
      }
    });
  }

  // 4. Projects (title, role, description)
  if (Array.isArray(resume.projects)) {
    resume.projects.forEach((proj, idx) => {
      const title = proj.title || '';
      const role = proj.role || '';
      const context = title ? `Project: ${title}` : `Project #${idx + 1}`;
      const text = [title, role, proj.description || ''].filter(Boolean).join(' ');
      if (text.trim()) {
        sections.push({
          section: 'projects',
          label: 'Projects',
          itemIndex: idx,
          context,
          text: text.trim(),
        });
      }
    });
  }

  // 5. Education
  if (Array.isArray(resume.education)) {
    resume.education.forEach((edu, idx) => {
      const degree = edu.degree || '';
      const field = edu.fieldOfStudy || '';
      const school = edu.school || '';
      const context = [degree, field, school].filter(Boolean).join(', ') || `Education #${idx + 1}`;
      const text = [degree, field, school, edu.description || ''].filter(Boolean).join(' ');
      if (text.trim()) {
        sections.push({
          section: 'education',
          label: 'Education',
          itemIndex: idx,
          context,
          text: text.trim(),
        });
      }
    });
  }

  // 6. Certifications
  if (Array.isArray(resume.certifications)) {
    resume.certifications.forEach((cert, idx) => {
      const name = cert.name || '';
      const issuer = cert.issuer || '';
      const context = [name, issuer].filter(Boolean).join(' - ') || `Certification #${idx + 1}`;
      const text = [name, issuer].filter(Boolean).join(' ');
      if (text.trim()) {
        sections.push({
          section: 'certifications',
          label: 'Certifications',
          itemIndex: idx,
          context,
          text: text.trim(),
        });
      }
    });
  }

  // 7. Languages
  if (Array.isArray(resume.languages)) {
    resume.languages.forEach((lang, idx) => {
      const name = lang.language || '';
      const prof = lang.proficiency || '';
      const text = [name, prof].filter(Boolean).join(' - ');
      if (text.trim()) {
        sections.push({
          section: 'languages',
          label: 'Languages',
          itemIndex: idx,
          context: 'Languages',
          text: text.trim(),
        });
      }
    });
  }

  // 8. Custom Sections
  if (Array.isArray(resume.customSections)) {
    resume.customSections.forEach((cs, csIdx) => {
      const title = cs.title || 'Custom Section';
      if (Array.isArray(cs.items)) {
        cs.items.forEach((item, itemIdx) => {
          const itemTitle = item.title || '';
          const subtitle = item.subtitle || '';
          const desc = item.description || '';
          const context = [title, itemTitle].filter(Boolean).join(' - ');
          const text = [itemTitle, subtitle, desc].filter(Boolean).join(' ');
          if (text.trim()) {
            sections.push({
              section: 'customSections',
              label: title,
              itemIndex: itemIdx,
              context,
              text: text.trim(),
            });
          }
        });
      }
    });
  }

  return sections;
}

/**
 * Extracts a concise, readable evidence snippet centered around the matched term
 */
export function extractSnippet(text, term) {
  if (!text || !term) return '';
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const lowerText = cleanText.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const idx = lowerText.indexOf(lowerTerm);

  if (idx === -1) {
    return cleanText.length > 150 ? cleanText.substring(0, 147) + '...' : cleanText;
  }

  // Locate natural sentence, bullet, or list boundaries
  let start = cleanText.lastIndexOf('.', idx);
  if (start === -1) start = cleanText.lastIndexOf('•', idx);
  if (start === -1) start = cleanText.lastIndexOf(';', idx);
  if (start === -1) start = cleanText.lastIndexOf(':', idx);
  if (start === -1) start = Math.max(0, idx - 60);
  else start = start + 1; // skip delimiter

  let end = cleanText.indexOf('.', idx + term.length);
  if (end === -1) end = cleanText.indexOf('•', idx + term.length);
  if (end === -1) end = cleanText.indexOf(';', idx + term.length);
  if (end === -1) end = Math.min(cleanText.length, idx + term.length + 80);

  let snippet = cleanText.substring(start, end).trim();
  if (snippet.length > 180) {
    snippet = snippet.substring(0, 177) + '...';
  }
  return snippet;
}

/**
 * Matches a single canonical requirement against structured resume sections.
 * Returns EXACT, ALIAS, PARTIAL, or MISSING with provenance and snippet.
 */
export function matchRequirementToResume(canonicalReq, structuredSections) {
  const {
    canonicalId,
    displayName,
    tier = 'REQUIRED',
    category = 'Technology',
    rawTerms = [],
    aliases = [],
    partialIndicators = [],
  } = canonicalReq;

  // Group sections by section type for priority-ordered inspection
  const sectionsByType = new Map();
  for (const s of structuredSections) {
    if (!sectionsByType.has(s.section)) {
      sectionsByType.set(s.section, []);
    }
    sectionsByType.get(s.section).push(s);
  }

  // ─────────────────────────────────────────────────────────────
  // 1. EXACT MATCH INSPECTION
  // ─────────────────────────────────────────────────────────────
  // Must appear in ONE coherent section item.
  // Tests exact displayName and original raw JD terms.
  const exactCandidates = Array.from(
    new Set([displayName, ...rawTerms].filter(Boolean))
  );

  for (const secName of SECTION_PRIORITY) {
    const items = sectionsByType.get(secName) || [];
    for (const item of items) {
      for (const candidate of exactCandidates) {
        if (checkTermMatch(candidate, item.text)) {
          return {
            matched: true,
            matchType: 'EXACT',
            canonicalId,
            canonicalName: displayName,
            tier,
            category,
            matchedTerm: candidate,
            section: item.section,
            sectionContext: item.context,
            evidenceSnippet: extractSnippet(item.text, candidate),
            rawTerms,
          };
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ALIAS MATCH INSPECTION
  // ─────────────────────────────────────────────────────────────
  // Resume contains a verified canonical alias from the taxonomy.
  const aliasCandidates = aliases.filter(
    alias => !exactCandidates.some(ec => ec.toLowerCase() === alias.toLowerCase())
  );

  for (const secName of SECTION_PRIORITY) {
    const items = sectionsByType.get(secName) || [];
    for (const item of items) {
      for (const alias of aliasCandidates) {
        if (checkTermMatch(alias, item.text)) {
          return {
            matched: true,
            matchType: 'ALIAS',
            canonicalId,
            canonicalName: displayName,
            tier,
            category,
            matchedTerm: alias,
            section: item.section,
            sectionContext: item.context,
            evidenceSnippet: extractSnippet(item.text, alias),
            rawTerms,
          };
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PARTIAL MATCH INSPECTION
  // ─────────────────────────────────────────────────────────────
  // Concept is meaningfully evidenced as related without full equivalence.
  if (Array.isArray(partialIndicators) && partialIndicators.length > 0) {
    // 3a. String indicators
    const stringIndicators = partialIndicators.filter(pi => typeof pi === 'string');
    for (const secName of SECTION_PRIORITY) {
      const items = sectionsByType.get(secName) || [];
      for (const item of items) {
        for (const indicator of stringIndicators) {
          if (checkTermMatch(indicator, item.text) || item.text.toLowerCase().includes(indicator.toLowerCase())) {
            return {
              matched: true,
              matchType: 'PARTIAL',
              canonicalId,
              canonicalName: displayName,
              tier,
              category,
              matchedTerm: indicator,
              section: item.section,
              sectionContext: item.context,
              evidenceSnippet: extractSnippet(item.text, indicator),
              rawTerms,
            };
          }
        }
      }
    }

    // 3b. Composite indicators (e.g. [['django', 'rest api']])
    const compositeIndicators = partialIndicators.filter(pi => Array.isArray(pi));
    for (const composite of compositeIndicators) {
      const matchedParts = [];
      for (const part of composite) {
        const foundItem = structuredSections.find(s => checkTermMatch(part, s.text));
        if (foundItem) {
          matchedParts.push({ part, context: foundItem.context, section: foundItem.section });
        }
      }

      if (matchedParts.length === composite.length && composite.length > 1) {
        const firstMatch = matchedParts[0];
        const summarySnippet = matchedParts.map(m => `${m.part} in ${m.context}`).join('; ');
        return {
          matched: true,
          matchType: 'PARTIAL',
          canonicalId,
          canonicalName: displayName,
          tier,
          category,
          matchedTerm: composite.join(' + '),
          section: firstMatch.section,
          sectionContext: firstMatch.context,
          evidenceSnippet: summarySnippet,
          rawTerms,
        };
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. MISSING
  // ─────────────────────────────────────────────────────────────
  return {
    matched: false,
    matchType: 'MISSING',
    canonicalId,
    canonicalName: displayName,
    tier,
    category,
    matchedTerm: null,
    section: null,
    sectionContext: null,
    evidenceSnippet: null,
    rawTerms,
  };
}

/**
 * Matches all canonical requirements against structured resume sections
 */
export function matchAllRequirements(canonicalRequirements, structuredSections) {
  if (!Array.isArray(canonicalRequirements)) return [];
  return canonicalRequirements.map(req =>
    matchRequirementToResume(req, structuredSections)
  );
}
