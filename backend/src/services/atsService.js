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
    const cleanKw = kw.toLowerCase().trim();
    if (cleanKw.length === 0) return;

    const isAlphaNumeric = /^[a-z0-9\s]+$/i.test(cleanKw);
    let isMatched = false;

    if (isAlphaNumeric) {
      // Safe word-boundary regex for standard alphanumeric words/phrases
      const safeKw = cleanKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${safeKw}\\b`, 'i');
      isMatched = regex.test(normalizedResume);
    } else {
      // Smart matching for keywords with special characters (e.g. C++, .NET, Node.js, C#, CI/CD)
      let idx = normalizedResume.indexOf(cleanKw);
      while (idx !== -1) {
        const charBefore = idx > 0 ? normalizedResume[idx - 1] : ' ';
        const charAfter = idx + cleanKw.length < normalizedResume.length ? normalizedResume[idx + cleanKw.length] : ' ';

        // Ensure word boundaries: the surrounding characters must be non-alphanumeric
        const isBeforeBoundary = !/[a-z0-9]/i.test(charBefore);
        const isAfterBoundary = !/[a-z0-9]/i.test(charAfter);

        if (isBeforeBoundary && isAfterBoundary) {
          isMatched = true;
          break;
        }
        idx = normalizedResume.indexOf(cleanKw, idx + 1);
      }
    }

    if (isMatched) {
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

  // 4. Recommendations compiling
  const recommendations = [];
  if (missingKeywords.length > 0) {
    recommendations.push(`Integrate high-importance target terms: [${missingKeywords.slice(0, 4).join(', ')}] in your skills or experience fields.`);
  }
  if (semanticMatchPercent < 70) {
    recommendations.push('Incorporate professional metrics and active industry terminology to lift the contextual semantic density.');
  }
  if (!resume.summary || resume.summary.length < 50) {
    recommendations.push('Craft a strong Professional Summary containing target role keywords.');
  }
  if (resume.experience?.length === 0) {
    recommendations.push('Add comprehensive professional experiences to satisfy resume structure parsing requirements.');
  }

  // Final Weighted ATS Score formulation
  const finalScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        keywordMatchPercent * 0.4 +
        semanticMatchPercent * 0.3 +
        skillAlignment * 0.2 +
        (resume.experience?.length > 0 ? 10 : 0)
      )
    )
  );

  return {
    atsScore: finalScore,
    breakdown: {
      keywordMatch: keywordMatchPercent,
      semanticMatch: semanticMatchPercent,
      missingKeywords,
      recommendations
    }
  };
}
