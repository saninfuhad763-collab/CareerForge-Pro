import { getEmbeddingVector } from './aiService.js';
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

/**
 * Calculates cosine similarity between two unit-normalized vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct)); // Clamp between 0 and 1
}

/**
 * Extracts all indexable text fields from a structured Resume object
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

/**
 * Central ATS scoring engine
 * Phase 2A: Powered by Canonical Requirements and Section-Aware Evidence Matching.
 * Preserves the exact score formula while replacing noisy string duplicates.
 */
export function calculateAtsScore(resume, jdAnalysis) {
  const resumeText = extractResumeText(resume);

  // 1. Canonical Requirement Collection & Deduplication
  const canonicalRequirements = collectCanonicalRequirements(jdAnalysis);

  if (canonicalRequirements.length === 0) {
    return {
      atsScore: 70, // Baseline score if no requirements are provided
      breakdown: {
        keywordMatch: 70,
        semanticMatch: 70,
        missingKeywords: [],
        recommendations: ['Provide a detailed Job Description to obtain highly tailored ATS suggestions.'],
        structuredRecommendations: [],
        matchedKeywords: [],
        matchedAliases: {},
        totalKeywordsEvaluated: 0,
        requiredMatched: [],
        requiredMissing: [],
        preferredMatched: [],
        preferredMissing: [],
        requirementEvidence: [],
        pointAttributions: {
          keywordMatch: { rawScore: 70, weightMultiplier: 0.4, finalContribution: 28 },
          semanticMatch: { rawScore: 70, weightMultiplier: 0.3, finalContribution: 21 },
          skillAlignment: { rawScore: 70, weightMultiplier: 0.2, finalContribution: 14 },
          experience: { rawScore: 70, weightMultiplier: 0.1, finalContribution: 7 },
        },
        categoryBreakdown: {
          keywordMatch: 40,
          semanticMatch: 30,
          skillAlignment: 20,
          experience: 10,
        },
      },
    };
  }

  // 2. Build Structured Resume Representation (Section-Aware)
  const structuredSections = buildStructuredResumeSections(resume);

  // 3. Section-Aware Evidence Matching
  const requirementEvidence = matchAllRequirements(canonicalRequirements, structuredSections);

  const foundRequirements = requirementEvidence.filter(
    e => e.matched && (e.matchType === 'EXACT' || e.matchType === 'ALIAS')
  );
  const aliasRequirements = requirementEvidence.filter(
    e => e.matched && e.matchType === 'ALIAS'
  );
  const missingRequirements = requirementEvidence.filter(
    e => !e.matched || e.matchType === 'MISSING'
  );

  const allKeywords = canonicalRequirements.map(r => r.displayName);
  const foundKeywords = foundRequirements.map(r => r.canonicalName);
  const missingKeywords = missingRequirements.map(r => r.canonicalName);
  const aliasMatchedKeywords = aliasRequirements.map(r => r.canonicalName);

  const matchedAliases = {};
  aliasRequirements.forEach(ar => {
    if (ar.matchedTerm) {
      matchedAliases[ar.canonicalName] = ar.matchedTerm;
    }
  });

  const requiredMatched = foundRequirements
    .filter(e => e.tier === 'REQUIRED')
    .map(e => e.canonicalName);
  const requiredMissing = missingRequirements
    .filter(e => e.tier === 'REQUIRED')
    .map(e => e.canonicalName);
  const preferredMatched = foundRequirements
    .filter(e => e.tier === 'PREFERRED')
    .map(e => e.canonicalName);
  const preferredMissing = missingRequirements
    .filter(e => e.tier === 'PREFERRED')
    .map(e => e.canonicalName);

  const keywordMatchPercent = Math.round(
    (foundKeywords.length / allKeywords.length) * 100
  );

  // 4. Semantic Similarity Score (preserved as in Phase 1)
  const normalizeList = list =>
    (list || [])
      .map(k => (typeof k === 'string' ? k.trim() : ''))
      .filter(k => k.length > 0);
  const required = normalizeList(jdAnalysis.requiredKeywords);
  const tech = normalizeList(jdAnalysis.technologies);
  const soft = normalizeList(jdAnalysis.softSkills);

  const resumeVector = getEmbeddingVector(resumeText);
  const jdTextCompiled = `${jdAnalysis.jobTitle || 'Role'} at ${
    jdAnalysis.company || 'Company'
  }. Required: ${required.join(', ')}. Tech: ${tech.join(', ')}. Soft skills: ${soft.join(', ')}`;
  const jdVector = getEmbeddingVector(jdTextCompiled);
  const semanticMatchPercent = Math.round(cosineSimilarity(resumeVector, jdVector) * 100);

  // 5. Alignment Checks (canonical technology alignment)
  let skillAlignment = 0;
  const reqTech = canonicalRequirements.filter(
    r => isTechCategory(r.category) && r.tier === 'REQUIRED'
  );
  if (reqTech.length > 0) {
    const foundTech = foundRequirements.filter(
      e => isTechCategory(e.category) && e.tier === 'REQUIRED'
    );
    skillAlignment = Math.round((foundTech.length / reqTech.length) * 100);
  } else {
    skillAlignment = keywordMatchPercent;
  }

  const hasExperience = resume.experience && resume.experience.length > 0;
  const experienceContribution = hasExperience ? 10 : 0;

  // Controlled normalization strategy
  let normalizedSemantic = semanticMatchPercent;
  if (keywordMatchPercent === 100 && skillAlignment === 100 && hasExperience) {
    normalizedSemantic = 100;
  } else {
    normalizedSemantic = Math.round(
      semanticMatchPercent * 0.3 + keywordMatchPercent * 0.7
    );
  }

  // 6. Recommendations compiling
  const recommendations = [];
  const structuredRecommendations = [];

  recommendations.push(
    `ATS Score Breakdown: Keyword Match: ${keywordMatchPercent}% (Weight: 40%), Skill Alignment: ${skillAlignment}% (Weight: 20%), Semantic Match: ${normalizedSemantic}% (Weight: 30%), Experience Presence: ${experienceContribution} pts (Weight: 10%).`
  );

  const positiveContribs = [];
  const negativeContribs = [];

  if (keywordMatchPercent >= 80) positiveContribs.push('Keyword Match');
  else negativeContribs.push(`Keyword Match (-${Math.round((100 - keywordMatchPercent) * 0.4)} pts)`);

  if (skillAlignment >= 80) positiveContribs.push('Skill Alignment');
  else negativeContribs.push(`Skill Alignment (-${Math.round((100 - skillAlignment) * 0.2)} pts)`);

  if (normalizedSemantic >= 80) positiveContribs.push('Semantic Match');
  else negativeContribs.push(`Semantic Match (-${Math.round((100 - normalizedSemantic) * 0.3)} pts)`);

  if (hasExperience) positiveContribs.push('Experience Presence');
  else negativeContribs.push('Experience Presence (-10 pts)');

  if (positiveContribs.length > 0) {
    recommendations.push(`Positive Drivers: Strong alignment in ${positiveContribs.join(', ')}.`);
  }
  if (negativeContribs.length > 0) {
    recommendations.push(`Improvement Drivers: Score reduced by ${negativeContribs.join(', ')}.`);
  }

  if (missingKeywords.length > 0) {
    recommendations.push(
      `Action Plan (Keywords): Integrate target terms [${missingKeywords
        .slice(0, 4)
        .join(', ')}] in your skills or experience fields.`
    );
  }

  missingRequirements.forEach(req => {
    const isRequired = req.tier === 'REQUIRED';
    const isTech = isTechCategory(req.category);
    let priority = 'Medium';
    let targetSection = 'General';
    let impact = 'Low';

    if (isRequired && isTech) {
      priority = 'Critical';
      targetSection = 'Skills or Experience';
      impact = 'High';
    } else if (isRequired) {
      priority = 'High';
      targetSection = 'Professional Summary';
      impact = 'High';
    } else if (isTech) {
      priority = 'Medium';
      targetSection = 'Skills or Experience';
      impact = 'Medium';
    }

    structuredRecommendations.push({
      type: 'Missing Keyword',
      priority,
      targetSection,
      message: getRecommendationMessage(req.canonicalName, targetSection, req.category, false),
      impact,
      confidence: 'High',
    });
  });

  aliasRequirements.forEach(req => {
    let targetSection = isTechCategory(req.category) ? 'Skills or Experience' : 'Professional Summary';
    structuredRecommendations.push({
      type: 'Strengthen Existing Phrase',
      priority: 'Medium',
      targetSection,
      message: getRecommendationMessage(req.canonicalName, targetSection, null, true),
      impact: 'Medium',
      confidence: 'High',
    });
  });

  if (normalizedSemantic < 80) {
    recommendations.push(
      'Action Plan (Semantic): Incorporate professional metrics and active industry terminology to lift contextual density.'
    );
    structuredRecommendations.push({
      type: 'Formatting Advice',
      priority: 'Low',
      targetSection: 'Experience',
      message: 'Incorporate professional metrics and active industry terminology to lift contextual density.',
      impact: 'Medium',
      confidence: 'High',
    });
  }

  if (!resume.summary || resume.summary.length < 50) {
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

  if (!hasExperience) {
    recommendations.push(
      'Action Plan (Experience): Add professional experience entries to satisfy resume structure parsing requirements.'
    );
    structuredRecommendations.push({
      type: 'Formatting Advice',
      priority: 'Low',
      targetSection: 'Experience',
      message: 'Add professional experience entries to satisfy resume structure parsing requirements.',
      impact: 'High',
      confidence: 'High',
    });
  }

  // Final Weighted ATS Score formulation (Preserved from Phase 1)
  const finalScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        keywordMatchPercent * 0.4 +
          normalizedSemantic * 0.3 +
          skillAlignment * 0.2 +
          experienceContribution
      )
    )
  );

  return {
    atsScore: finalScore,
    breakdown: {
      keywordMatch: keywordMatchPercent,
      semanticMatch: normalizedSemantic,
      rawSemanticMatch: semanticMatchPercent,
      skillAlignment: skillAlignment,
      experienceContribution: experienceContribution,
      missingKeywords,
      recommendations,
      structuredRecommendations,
      matchedKeywords: foundKeywords,
      matchedAliases,
      totalKeywordsEvaluated: allKeywords.length,
      requiredMatched,
      requiredMissing,
      preferredMatched,
      preferredMissing,
      requirementEvidence,
      pointAttributions: {
        keywordMatch: {
          rawScore: keywordMatchPercent,
          weightMultiplier: 0.4,
          finalContribution: keywordMatchPercent * 0.4,
        },
        semanticMatch: {
          rawScore: normalizedSemantic,
          weightMultiplier: 0.3,
          finalContribution: normalizedSemantic * 0.3,
        },
        skillAlignment: {
          rawScore: skillAlignment,
          weightMultiplier: 0.2,
          finalContribution: skillAlignment * 0.2,
        },
        experience: {
          rawScore: hasExperience ? 100 : 0,
          weightMultiplier: 0.1,
          finalContribution: experienceContribution,
        },
      },
      categoryBreakdown: {
        keywordMatch: 40,
        semanticMatch: 30,
        skillAlignment: 20,
        experience: 10,
      },
    },
  };
}

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
      return `The keyword "${keyword}" is missing from your resume. Add it to your ${targetSection}.`;
  }
};

/**
 * Direct single-term matcher for backward compatibility
 */
export const checkSingleTermMatch = (term, text) => {
  return checkTermMatch(term, text);
};

/**
 * Keyword match evaluator with taxonomy awareness
 */
export const evaluateKeywordMatch = (keyword, text, aiGeneratedAliases = {}) => {
  if (!keyword || !text) return { matched: false };
  const cleanKw = keyword.toLowerCase().trim();
  if (!cleanKw) return { matched: false };

  // Check exact term match
  if (checkTermMatch(cleanKw, text)) {
    return { matched: true, matchType: 'EXACT' };
  }

  // Check taxonomy aliases
  const canon = canonicalizeTerm(cleanKw);
  if (canon && Array.isArray(canon.aliases)) {
    for (const alias of canon.aliases) {
      if (alias !== cleanKw && checkTermMatch(alias, text)) {
        return { matched: true, matchType: 'ALIAS' };
      }
    }
  }

  // Dynamic AI aliases if provided
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
 * Public predicate exported for backwards compatibility
 */
export const isKeywordMatched = (keyword, text, aiGeneratedAliases = {}) => {
  return evaluateKeywordMatch(keyword, text, aiGeneratedAliases).matched;
};
