import { getEmbeddingVector } from './aiService.js';

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
 */
export function calculateAtsScore(resume, jdAnalysis) {
  const resumeText = extractResumeText(resume);
  const normalizedResume = resumeText.toLowerCase();

  const required = jdAnalysis.requiredKeywords || [];
  const preferred = jdAnalysis.preferredKeywords || [];
  const soft = jdAnalysis.softSkills || [];
  const tech = jdAnalysis.technologies || [];

  const allKeywords = [...new Set([...required, ...preferred, ...soft, ...tech])].filter(k => k.trim().length > 0);

  if (allKeywords.length === 0) {
    return {
      atsScore: 70, // Baseline baseline score if no keywords are provided
      breakdown: {
        keywordMatch: 70,
        semanticMatch: 70,
        missingKeywords: [],
        recommendations: ['Provide a detailed Job Description to obtain highly tailored ATS suggestions.']
      }
    };
  }

  // 1. Keyword Matching
  const foundKeywords = [];
  const missingKeywords = [];

  allKeywords.forEach(kw => {
    if (isKeywordMatched(kw, normalizedResume)) {
      foundKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatchPercent = Math.round((foundKeywords.length / allKeywords.length) * 100);

  // 2. Semantic Similarity Score
  const resumeVector = getEmbeddingVector(resumeText);
  const jdTextCompiled = `${jdAnalysis.jobTitle} at ${jdAnalysis.company}. Required: ${required.join(', ')}. Tech: ${tech.join(', ')}. Soft skills: ${soft.join(', ')}`;
  const jdVector = getEmbeddingVector(jdTextCompiled);
  const semanticMatchPercent = Math.round(cosineSimilarity(resumeVector, jdVector) * 100);

  // 3. Alignment Checks
  let skillAlignment = 0;
  const reqTechCount = required.filter(k => tech.includes(k)).length;
  if (reqTechCount > 0) {
    const foundTechCount = foundKeywords.filter(k => tech.includes(k) && required.includes(k)).length;
    skillAlignment = Math.round((foundTechCount / reqTechCount) * 100);
  } else {
    skillAlignment = keywordMatchPercent;
  }

  const hasExperience = resume.experience && resume.experience.length > 0;
  const experienceContribution = hasExperience ? 10 : 0;

  // Controlled normalization strategy to remove the artificial 93% ceiling
  // and reduce the noise of the hash-based vector generator.
  let normalizedSemantic = semanticMatchPercent;
  if (keywordMatchPercent === 100 && skillAlignment === 100 && hasExperience) {
    // Perfect match conditions: normalize semanticMatchPercent to 100% to allow a final score of 100%
    normalizedSemantic = 100;
  } else {
    // Reduce semantic noise: blend with keywordMatchPercent to act as a supporting signal
    // This reduces the noise of the random vector generator and ensures it doesn't overpower keyword match.
    normalizedSemantic = Math.round(semanticMatchPercent * 0.3 + keywordMatchPercent * 0.7);
  }

  // 4. Recommendations compiling (incorporating ATS Transparency Details)
  const recommendations = [];

  // ATS Transparency Breakdown
  recommendations.push(
    `ATS Score Breakdown: Keyword Match: ${keywordMatchPercent}% (Weight: 40%), Skill Alignment: ${skillAlignment}% (Weight: 20%), Semantic Match: ${normalizedSemantic}% (Weight: 30%), Experience Presence: ${experienceContribution} pts (Weight: 10%).`
  );

  // Positive vs. Negative Attribution
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

  // Actionable strategic advice reflecting deficiencies
  if (missingKeywords.length > 0) {
    recommendations.push(`Action Plan (Keywords): Integrate target terms [${missingKeywords.slice(0, 4).join(', ')}] in your skills or experience fields.`);
  }
  if (normalizedSemantic < 80) {
    recommendations.push('Action Plan (Semantic): Incorporate professional metrics and active industry terminology to lift contextual density.');
  }
  if (!resume.summary || resume.summary.length < 50) {
    recommendations.push('Action Plan (Summary): Craft a strong Professional Summary containing target role keywords.');
  }
  if (!hasExperience) {
    recommendations.push('Action Plan (Experience): Add professional experience entries to satisfy resume structure parsing requirements.');
  }

  // Final Weighted ATS Score formulation
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
      recommendations
    }
  };
}

const ALIAS_MAP = {
  "mongodb": ["mongodb", "mongo", "nosql", "document database"],
  "mongo": ["mongodb", "mongo", "nosql", "document database"],
  "express.js": ["express.js", "expressjs", "express"],
  "expressjs": ["express.js", "expressjs", "express"],
  "express": ["express.js", "expressjs", "express"],
  "node.js": ["node.js", "nodejs", "node"],
  "nodejs": ["node.js", "nodejs", "node"],
  "node": ["node.js", "nodejs", "node"],
  "ci/cd": ["ci/cd", "cicd", "continuous integration", "continuous delivery", "github actions", "pipelines"],
  "cicd": ["ci/cd", "cicd", "continuous integration", "continuous delivery", "github actions", "pipelines"],
  "restful apis": ["restful apis", "rest api", "restful", "restapis", "rest apis"],
  "rest apis": ["restful apis", "rest api", "restful", "restapis", "rest apis"],
  "rest api": ["restful apis", "rest api", "restful", "restapis", "rest apis"],
  "jwt": ["jwt", "json web token"],
  "react": ["react", "reactjs", "react.js"],
  "reactjs": ["react", "reactjs", "react.js"],
  "react.js": ["react", "reactjs", "react.js"],
  "redux": ["redux", "reduxtoolkit", "rtk"],
  "aws": ["aws", "amazon web services", "s3", "ec2"],
  "docker": ["docker", "containerization", "kubernetes", "containers"],
  "typescript": ["typescript", "ts"],
  "ts": ["typescript", "ts"],
  "javascript": ["javascript", "js", "es6"],
  "js": ["javascript", "js", "es6"],
  "next.js": ["next.js", "nextjs"],
  "nextjs": ["next.js", "nextjs"],
  "jest": ["jest", "unit testing", "testing"],
  "cypress": ["cypress", "e2e testing", "integration testing"],
  "tailwind-css": ["tailwind-css", "tailwindcss", "tailwind"],
  "tailwindcss": ["tailwind-css", "tailwindcss", "tailwind"],
  "tailwind": ["tailwind-css", "tailwindcss", "tailwind"],
  "tableau": ["tableau", "business intelligence", "bi dashboard"],
  "looker": ["looker", "business intelligence", "bi dashboard"]
};

const checkSingleTermMatch = (term, text) => {
  const cleanTerm = term.toLowerCase().trim();
  const cleanText = text.toLowerCase();

  if (!cleanTerm || !cleanText) return false;

  const isAlphaNumeric = /^[a-z0-9\s]+$/i.test(cleanTerm);

  if (isAlphaNumeric) {
    const escaped = cleanTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(cleanText);
  } else {
    let idx = cleanText.indexOf(cleanTerm);
    while (idx !== -1) {
      const charBefore = idx > 0 ? cleanText[idx - 1] : ' ';
      const charAfter = idx + cleanTerm.length < cleanText.length ? cleanText[idx + cleanTerm.length] : ' ';

      const startsWithAlpha = /[a-z0-9]/i.test(cleanTerm[0]);
      const endsWithAlpha = /[a-z0-9]/i.test(cleanTerm[cleanTerm.length - 1]);

      const isBeforeBoundary = !startsWithAlpha || !/[a-z0-9]/i.test(charBefore);
      const isAfterBoundary = !endsWithAlpha || !/[a-z0-9]/i.test(charAfter);

      if (isBeforeBoundary && isAfterBoundary) {
        return true;
      }
      idx = cleanText.indexOf(cleanTerm, idx + 1);
    }
    return false;
  }
};

export const isKeywordMatched = (keyword, text) => {
  const cleanKw = keyword.toLowerCase().trim();
  if (!cleanKw) return false;

  const aliases = ALIAS_MAP[cleanKw] || [cleanKw];

  if (aliases.some(alias => checkSingleTermMatch(alias, text))) {
    return true;
  }

  if (cleanKw.includes(' ') || cleanKw.includes('-')) {
    const words = cleanKw.split(/[\s\-._]+/).filter(w => w.length > 3);
    if (words.length > 1) {
      return words.every(word => checkSingleTermMatch(word, text));
    }
  }

  return false;
};
