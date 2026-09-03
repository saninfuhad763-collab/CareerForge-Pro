/**
 * ATS Scoring Service – Phase 2B: Deterministic Evidence-Driven Scoring
 *
 * Scoring Formula (deterministic, reproducible):
 *   requiredScore  = (requiredEvidencePoints / totalRequired) * 100
 *   preferredScore = (preferredEvidencePoints / totalPreferred) * 100
 *   expScore       = 10 if resume has at least one experience entry
 *
 *   finalScore = clamp(round(
 *     requiredScore  * 0.70 +
 *     preferredScore * 0.20 +
 *     expScore
 *   ), 0, 100)
 *
 * Evidence point values:
 *   EXACT   = 1.0 (full credit)
 *   ALIAS   = 1.0 (full credit – verified canonical synonym)
 *   PARTIAL = 0.5 (half credit – meaningful but incomplete evidence)
 *   MISSING = 0.0
 *
 * NOTE: getEmbeddingVector() is imported ONLY to support resume.embedding persistence
 * (an existing feature in aiController.js). It does NOT influence the ATS score.
 * Phase 2A's pseudo-semantic component has been completely removed from scoring.
 *
 * Part of CareerForge Pro ATS Phase 2B Hardening.
 */

import {
  collectCanonicalRequirements,
  isTechCategory,
  checkTermMatch,
  canonicalizeTerm,
} from './canonicalTaxonomy.js';
import {
  buildStructuredResumeSections,
  matchAllRequirements,
} from './evidenceMatcher.js';

// ─────────────────────────────────────────────────────────────────────────────
// SCORING CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evidence credit values.
 * EXACT and ALIAS receive full credit; PARTIAL receives conservative half credit.
 * Deliberately chosen to be: explainable, simple, and non-inflationary.
 */
const EVIDENCE_CREDIT = {
  EXACT: 1.0,
  ALIAS: 1.0,
  PARTIAL: 0.5,
  MISSING: 0.0,
};

/**
 * Weight breakdown (must sum to 1.0 when expWeight is expressed as a fraction).
 * Required requirements dominate because missing a required skill is critically penalized.
 * Preferred requirements carry meaningful but secondary weight.
 * Experience presence is a structural bonus (max 10 points added to the 90-point base).
 *
 *   0.70 × Required Coverage Score (0–100) → max contribution 70 pts
 *   0.20 × Preferred Coverage Score (0–100) → max contribution 20 pts
 *   10 pts fixed if resume has ≥1 experience entry
 */
const REQUIRED_WEIGHT = 0.70;
const PREFERRED_WEIGHT = 0.20;
const EXPERIENCE_BONUS = 10;

// ─────────────────────────────────────────────────────────────────────────────
// TEXT EXTRACTION (unchanged, used by aiController.js for embedding storage)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts all indexable text fields from a structured Resume object.
 * Used by aiController.js for embedding vector storage (not scoring).
 */
export function extractResumeText(resume) {
  const parts = [];

  if (resume.title) parts.push(resume.title);
  if (resume.summary) parts.push(resume.summary);

  if (resume.personalInfo) {
    const p = resume.personalInfo;
    parts.push(p.fullName || '', p.location || '');
  }

  if (resume.experience && Array.isArray(resume.experience)) {
    resume.experience.forEach(exp => {
      parts.push(exp.company || '', exp.position || '', exp.description || '');
    });
  }

  if (resume.education && Array.isArray(resume.education)) {
    resume.education.forEach(edu => {
      parts.push(edu.school || '', edu.degree || '', edu.fieldOfStudy || '', edu.description || '');
    });
  }

  if (resume.skills && Array.isArray(resume.skills)) {
    resume.skills.forEach(s => {
      parts.push(s.name || '');
      if (s.keywords && Array.isArray(s.keywords)) {
        parts.push(...s.keywords);
      }
    });
  }

  if (resume.projects && Array.isArray(resume.projects)) {
    resume.projects.forEach(p => {
      parts.push(p.title || '', p.role || '', p.description || '');
    });
  }

  if (resume.certifications && Array.isArray(resume.certifications)) {
    resume.certifications.forEach(c => {
      parts.push(c.name || '', c.issuer || '');
    });
  }

  if (resume.languages && Array.isArray(resume.languages)) {
    resume.languages.forEach(l => {
      parts.push(l.language || '', l.proficiency || '');
    });
  }

  if (resume.customSections && Array.isArray(resume.customSections)) {
    resume.customSections.forEach(cs => {
      parts.push(cs.title || '');
      if (cs.items && Array.isArray(cs.items)) {
        cs.items.forEach(item => {
          parts.push(item.title || '', item.subtitle || '', item.description || '');
        });
      }
    });
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE CREDIT CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the fractional credit value for a single matched requirement.
 * EXACT/ALIAS = 1.0; PARTIAL = 0.5; MISSING = 0.0.
 */
function getEvidenceCredit(matchResult) {
  return EVIDENCE_CREDIT[matchResult.matchType] ?? 0.0;
}

/**
 * Computes a coverage score (0–100) for a subset of evidence results.
 * If the subset is empty, returns 100 (no requirements = full score, graceful).
 */
function computeCoverageScore(evidenceSubset) {
  if (evidenceSubset.length === 0) return 100;
  const totalCredit = evidenceSubset.reduce((sum, e) => sum + getEvidenceCredit(e), 0);
  return Math.round((totalCredit / evidenceSubset.length) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE-DRIVEN STRATEGIC ADVICE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a single structured recommendation grounded only in verified evidence.
 * - MISSING: explains what is absent and recommends genuine experience addition.
 * - PARTIAL: explains what related evidence was found and what specific gap remains.
 * - ALIAS: encourages adopting the exact canonical term for ATS parser compatibility.
 * Does NOT tell candidates to fabricate experience they don't have.
 */
function buildEvidenceRecommendation(req) {
  const { canonicalName, tier, category, matchType, matchedTerm, evidenceSnippet } = req;
  const isRequired = tier === 'REQUIRED';
  const isTech = isTechCategory(category);
  const targetSection = isRequired && isTech ? 'Skills or Experience' : isRequired ? 'Professional Summary' : 'Skills';
  const priority = isRequired ? (matchType === 'PARTIAL' ? 'High' : 'Critical') : 'Medium';
  const impact = isRequired ? 'High' : 'Medium';

  let message;
  let type;

  if (matchType === 'PARTIAL') {
    // Explain what was found and what specific gap remains
    const foundNote = evidenceSnippet
      ? `Resume demonstrates: "${evidenceSnippet.substring(0, 100)}".`
      : `Partial evidence of ${canonicalName} was found.`;
    message = `${foundNote} However, broader ${canonicalName} practices are not explicitly demonstrated. If you have hands-on ${canonicalName} experience, expand the relevant ${targetSection} section with concrete implementation details.`;
    type = 'Strengthen Existing Evidence';
  } else if (matchType === 'ALIAS') {
    // Candidate already qualifies – just suggest exact terminology
    message = `Your resume references a related concept to '${canonicalName}' (via '${matchedTerm}'). Using the exact ATS term '${canonicalName}' in your ${targetSection} maximises parser recognition without misrepresenting your experience.`;
    type = 'Terminology Alignment';
  } else {
    // MISSING – explain that no verified evidence exists; only recommend if candidate genuinely has it
    message = `No verified evidence of '${canonicalName}' was found in your resume. If you have genuine experience with ${canonicalName}, consider demonstrating it in your ${targetSection}.`;
    type = 'Missing Requirement';
  }

  return {
    type,
    priority,
    targetSection,
    message,
    impact,
    confidence: 'High',
    canonicalName,
    canonicalId: req.canonicalId,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Central ATS scoring engine – Phase 2B.
 *
 * Deterministic formula (same inputs always produce same score):
 *   finalScore = clamp(round(
 *     requiredCoverage * 0.70 +
 *     preferredCoverage * 0.20 +
 *     experienceBonus (10 if experience section present)
 *   ), 0, 100)
 *
 * Evidence hierarchy (single authoritative path):
 *   Canonical JD requirements
 *   → collectCanonicalRequirements()   (dedup + tier assignment)
 *   → buildStructuredResumeSections()  (section-aware resume breakdown)
 *   → matchAllRequirements()           (EXACT / ALIAS / PARTIAL / MISSING)
 *   → getEvidenceCredit()              (1.0 / 1.0 / 0.5 / 0.0)
 *   → computeCoverageScore()           (per-tier aggregate)
 *   → final score
 *
 * No pseudo-semantic vectors influence this score.
 * No hash-cosine similarity is used.
 * The old getEmbeddingVector() is NOT called in this function.
 */
export function calculateAtsScore(resume, jdAnalysis) {
  // ── 1. Canonical Requirement Collection & Deduplication ─────────────────
  const canonicalRequirements = collectCanonicalRequirements(jdAnalysis);

  if (canonicalRequirements.length === 0) {
    // No requirements provided – return a neutral 70 baseline with explanatory advice
    return buildEmptyJdResult();
  }

  // ── 2. Section-Aware Resume Representation ───────────────────────────────
  const structuredSections = buildStructuredResumeSections(resume);

  // ── 3. Authoritative Evidence Matching ───────────────────────────────────
  // This is the SINGLE source of truth for all matching decisions.
  const requirementEvidence = matchAllRequirements(canonicalRequirements, structuredSections);

  // ── 4. Partition by Tier ─────────────────────────────────────────────────
  const requiredEvidence = requirementEvidence.filter(e => e.tier === 'REQUIRED');
  const preferredEvidence = requirementEvidence.filter(e => e.tier === 'PREFERRED');

  // ── 5. Per-Tier Coverage Scores ───────────────────────────────────────────
  // Each tier is scored independently as 0–100 based on evidence credit.
  const requiredCoverage = computeCoverageScore(requiredEvidence);   // 0–100
  const preferredCoverage = computeCoverageScore(preferredEvidence); // 0–100

  // ── 6. Experience Presence Bonus ─────────────────────────────────────────
  const hasExperience = Array.isArray(resume.experience) && resume.experience.length > 0;
  const experienceBonus = hasExperience ? EXPERIENCE_BONUS : 0;

  // ── 7. Deterministic Final Score ─────────────────────────────────────────
  const rawScore =
    requiredCoverage  * REQUIRED_WEIGHT +
    preferredCoverage * PREFERRED_WEIGHT +
    experienceBonus;

  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // ── 8. Build Detailed Breakdowns ─────────────────────────────────────────

  // Match-type partitions for all evidence
  const exactEvidence   = requirementEvidence.filter(e => e.matchType === 'EXACT');
  const aliasEvidence   = requirementEvidence.filter(e => e.matchType === 'ALIAS');
  const partialEvidence = requirementEvidence.filter(e => e.matchType === 'PARTIAL');
  const missingEvidence = requirementEvidence.filter(e => e.matchType === 'MISSING');

  // Legacy field compatibility: matched = EXACT + ALIAS (full credit)
  const foundEvidence   = requirementEvidence.filter(e =>
    e.matchType === 'EXACT' || e.matchType === 'ALIAS'
  );

  const foundKeywords   = foundEvidence.map(e => e.canonicalName);
  const missingKeywords = missingEvidence.map(e => e.canonicalName);
  const partialKeywords = partialEvidence.map(e => e.canonicalName);

  const matchedAliases = {};
  aliasEvidence.forEach(ae => {
    if (ae.matchedTerm) {
      matchedAliases[ae.canonicalName] = ae.matchedTerm;
    }
  });

  const requiredMatched = requiredEvidence
    .filter(e => e.matchType === 'EXACT' || e.matchType === 'ALIAS')
    .map(e => e.canonicalName);
  const requiredPartial = requiredEvidence
    .filter(e => e.matchType === 'PARTIAL')
    .map(e => e.canonicalName);
  const requiredMissing = requiredEvidence
    .filter(e => e.matchType === 'MISSING')
    .map(e => e.canonicalName);

  const preferredMatched = preferredEvidence
    .filter(e => e.matchType === 'EXACT' || e.matchType === 'ALIAS')
    .map(e => e.canonicalName);
  const preferredPartial = preferredEvidence
    .filter(e => e.matchType === 'PARTIAL')
    .map(e => e.canonicalName);
  const preferredMissing = preferredEvidence
    .filter(e => e.matchType === 'MISSING')
    .map(e => e.canonicalName);

  // ── 9. Canonical Technology Alignment (legacy field: skillAlignment) ──────
  // Measures how many required technical requirements are covered (EXACT or ALIAS only).
  // Retained for backward compatibility but does not influence final score.
  const reqTech = requiredEvidence.filter(e => isTechCategory(e.category));
  const skillAlignment = reqTech.length > 0
    ? Math.round(
        reqTech.filter(e => e.matchType === 'EXACT' || e.matchType === 'ALIAS').length
        / reqTech.length * 100
      )
    : requiredCoverage;

  // ── 10. Evidence-Driven Advice ─────────────────────────────────────────
  const structuredRecommendations = [];
  const recommendations = [];

  // Score breakdown explanation (plain text, appears first)
  recommendations.push(
    `ATS Score Breakdown (Phase 2B – Deterministic): ` +
    `Required Coverage: ${requiredCoverage}% × 70% = ${Math.round(requiredCoverage * REQUIRED_WEIGHT)} pts; ` +
    `Preferred Coverage: ${preferredCoverage}% × 20% = ${Math.round(preferredCoverage * PREFERRED_WEIGHT)} pts; ` +
    `Experience Bonus: ${experienceBonus} pts. ` +
    `Final: ${finalScore}/100.`
  );

  // Advice for MISSING required requirements (highest priority)
  missingEvidence
    .filter(e => e.tier === 'REQUIRED')
    .forEach(req => structuredRecommendations.push(buildEvidenceRecommendation(req)));

  // Advice for PARTIAL requirements (show what was found + what gap remains)
  partialEvidence.forEach(req =>
    structuredRecommendations.push(buildEvidenceRecommendation(req))
  );

  // Advice for ALIAS matches (terminology alignment – low urgency)
  aliasEvidence.forEach(req =>
    structuredRecommendations.push(buildEvidenceRecommendation(req))
  );

  // Advice for MISSING preferred requirements (lower priority)
  missingEvidence
    .filter(e => e.tier === 'PREFERRED')
    .forEach(req => structuredRecommendations.push(buildEvidenceRecommendation(req)));

  if (missingKeywords.length > 0) {
    recommendations.push(
      `Missing Requirements: ${missingKeywords.slice(0, 4).join(', ')}. ` +
      `Add genuine experience with these technologies to your resume if applicable.`
    );
  }

  if (partialKeywords.length > 0) {
    recommendations.push(
      `Partially evidenced: ${partialKeywords.join(', ')}. ` +
      `Expand with explicit implementation details to earn full credit.`
    );
  }

  if (!hasExperience) {
    recommendations.push(
      'Action Plan (Experience): Add professional experience entries to satisfy resume structure parsing requirements.'
    );
    structuredRecommendations.push({
      type: 'Formatting Advice',
      priority: 'High',
      targetSection: 'Experience',
      message: 'Add professional experience entries to satisfy resume structure parsing requirements.',
      impact: 'High',
      confidence: 'High',
    });
  }

  if (!resume.summary || String(resume.summary).length < 50) {
    recommendations.push(
      'Action Plan (Summary): Craft a strong Professional Summary containing target role keywords.'
    );
    structuredRecommendations.push({
      type: 'Formatting Advice',
      priority: 'Low',
      targetSection: 'Professional Summary',
      message: 'Craft a strong Professional Summary containing target role keywords.',
      impact: 'Medium',
      confidence: 'High',
    });
  }

  // ── 11. Return Full Result Object ─────────────────────────────────────────
  return {
    atsScore: finalScore,
    breakdown: {
      // Phase 2B deterministic coverage scores
      requiredCoverage,
      preferredCoverage,
      experienceBonus,

      // Evidence categorisation
      exactMatches: exactEvidence.map(e => e.canonicalName),
      aliasMatches: aliasEvidence.map(e => e.canonicalName),
      partialMatches: partialKeywords,
      missingRequirements: missingKeywords,

      // Legacy fields (backward compat – consumed by frontend and aiController)
      keywordMatch: requiredCoverage,      // legacy: was keyword match percent
      semanticMatch: requiredCoverage,     // legacy: was semantic; now aliases to requiredCoverage
      skillAlignment,
      experienceContribution: experienceBonus,
      matchedKeywords: foundKeywords,
      missingKeywords,
      matchedAliases,
      totalKeywordsEvaluated: canonicalRequirements.length,

      // Tier-separated match lists (used by frontend ATS panel and controller)
      requiredMatched,
      requiredPartial,
      requiredMissing,
      preferredMatched,
      preferredPartial,
      preferredMissing,

      // Full evidence payload (consumed by ATSReportModal and persisted to DB)
      requirementEvidence,

      // Advice
      recommendations,
      structuredRecommendations,

      // Score attribution (transparent explainability for Phase 2B)
      pointAttributions: {
        requiredCoverage: {
          rawScore: requiredCoverage,
          weightMultiplier: REQUIRED_WEIGHT,
          finalContribution: Math.round(requiredCoverage * REQUIRED_WEIGHT),
        },
        preferredCoverage: {
          rawScore: preferredCoverage,
          weightMultiplier: PREFERRED_WEIGHT,
          finalContribution: Math.round(preferredCoverage * PREFERRED_WEIGHT),
        },
        experience: {
          rawScore: hasExperience ? 100 : 0,
          weightMultiplier: EXPERIENCE_BONUS / 100,
          finalContribution: experienceBonus,
        },
        // Legacy keys retained to avoid breaking any downstream consumers
        semanticMatch: {
          rawScore: 0,
          weightMultiplier: 0,
          finalContribution: 0,
          note: 'Phase 2B: pseudo-semantic scoring removed. This field is zero.',
        },
        skillAlignment: {
          rawScore: skillAlignment,
          weightMultiplier: 0,
          finalContribution: 0,
          note: 'Phase 2B: skillAlignment is reported for transparency but does not contribute to final score.',
        },
      },
      categoryBreakdown: {
        requiredCoverage: Math.round(REQUIRED_WEIGHT * 100),  // 70
        preferredCoverage: Math.round(PREFERRED_WEIGHT * 100), // 20
        experience: EXPERIENCE_BONUS,                          // 10
        // Legacy labels for any UI code reading these
        keywordMatch: Math.round(REQUIRED_WEIGHT * 100),
        semanticMatch: 0,
        skillAlignment: 0,
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY JD FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

function buildEmptyJdResult() {
  return {
    atsScore: 70,
    breakdown: {
      requiredCoverage: 70,
      preferredCoverage: 70,
      experienceBonus: 0,
      exactMatches: [],
      aliasMatches: [],
      partialMatches: [],
      missingRequirements: [],
      keywordMatch: 70,
      semanticMatch: 70,
      skillAlignment: 70,
      experienceContribution: 0,
      missingKeywords: [],
      recommendations: ['Provide a detailed Job Description to obtain highly tailored ATS suggestions.'],
      structuredRecommendations: [],
      matchedKeywords: [],
      matchedAliases: {},
      totalKeywordsEvaluated: 0,
      requiredMatched: [],
      requiredPartial: [],
      requiredMissing: [],
      preferredMatched: [],
      preferredPartial: [],
      preferredMissing: [],
      requirementEvidence: [],
      pointAttributions: {
        requiredCoverage:  { rawScore: 70, weightMultiplier: 0.70, finalContribution: 49 },
        preferredCoverage: { rawScore: 70, weightMultiplier: 0.20, finalContribution: 14 },
        experience:        { rawScore: 0,  weightMultiplier: 0.10, finalContribution: 0 },
        semanticMatch:     { rawScore: 0,  weightMultiplier: 0,    finalContribution: 0 },
        skillAlignment:    { rawScore: 70, weightMultiplier: 0,    finalContribution: 0 },
      },
      categoryBreakdown: {
        requiredCoverage: 70,
        preferredCoverage: 20,
        experience: 10,
        keywordMatch: 70,
        semanticMatch: 0,
        skillAlignment: 0,
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION MESSAGE LIBRARY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a category-specific recommendation message for a missing requirement.
 * Does NOT fabricate experience – all messages qualify with "if applicable" intent.
 */
export const getRecommendationMessage = (
  keyword,
  targetSection,
  dictionaryCategory,
  isAlias = false
) => {
  if (isAlias) {
    return `You mentioned a related concept to '${keyword}'. Consider updating your wording to the exact ATS terminology to ensure maximum parser compatibility.`;
  }

  switch (dictionaryCategory) {
    case 'Programming Language':
      return `Demonstrate your proficiency in ${keyword} within your ${targetSection} by mentioning a specific module or feature you developed.`;
    case 'Framework':
      return `Add ${keyword} to your ${targetSection} and briefly mention the architecture or component you built with it.`;
    case 'Database':
      return `If you have experience, mention designing, querying, or scaling ${keyword} inside your ${targetSection}.`;
    case 'Cloud':
    case 'DevOps':
      return `Highlight deployment or infrastructure experience by adding ${keyword} to your ${targetSection}.`;
    case 'Testing':
      return `Showcase software quality assurance by adding ${keyword} to your ${targetSection}.`;
    case 'Security':
      return `Highlight security protocols and implementation details for ${keyword} in your ${targetSection}.`;
    case 'Architecture':
      return `Elaborate on architectural patterns related to ${keyword} in your ${targetSection}.`;
    case 'Communication':
      return `Strengthen your ${targetSection} by mentioning cross-functional collaboration or stakeholder management to satisfy the '${keyword}' requirement.`;
    case 'Leadership':
      return `Highlight '${keyword}' in your ${targetSection} by describing team growth, project spearheading, or direct reports.`;
    case 'Problem Solving':
      return `Demonstrate '${keyword}' in your ${targetSection} by outlining a complex challenge you successfully resolved.`;
    case 'Teamwork':
      return `Showcase your '${keyword}' capability inside your ${targetSection} by mentioning your role within collaborative deliveries.`;
    default:
      return `The keyword "${keyword}" is missing from your resume. Add it to your ${targetSection} if you have genuine experience with it.`;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD COMPATIBILITY EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Direct single-term matcher – backward compat for any external callers.
 */
export const checkSingleTermMatch = (term, text) => {
  return checkTermMatch(term, text);
};

/**
 * Keyword match evaluator with taxonomy alias awareness.
 * Used by legacy test scripts; also exported for external consumers.
 */
export const evaluateKeywordMatch = (keyword, text, aiGeneratedAliases = {}) => {
  if (!keyword || !text) return { matched: false };
  const cleanKw = keyword.toLowerCase().trim();
  if (!cleanKw) return { matched: false };

  if (checkTermMatch(cleanKw, text)) {
    return { matched: true, matchType: 'EXACT' };
  }

  const canon = canonicalizeTerm(cleanKw);
  if (canon && Array.isArray(canon.aliases)) {
    for (const alias of canon.aliases) {
      if (alias !== cleanKw && checkTermMatch(alias, text)) {
        return { matched: true, matchType: 'ALIAS' };
      }
    }
  }

  let dynamicAliases = aiGeneratedAliases[cleanKw] || aiGeneratedAliases[keyword];
  if (Array.isArray(dynamicAliases)) {
    for (const dyn of dynamicAliases) {
      if (typeof dyn === 'string' && dyn.trim() && dyn.toLowerCase().trim() !== cleanKw) {
        if (checkTermMatch(dyn, text)) {
          return { matched: true, matchType: 'ALIAS' };
        }
      }
    }
  }

  return { matched: false };
};

/**
 * Public boolean predicate – backward compat.
 */
export const isKeywordMatched = (keyword, text, aiGeneratedAliases = {}) => {
  return evaluateKeywordMatch(keyword, text, aiGeneratedAliases).matched;
};
