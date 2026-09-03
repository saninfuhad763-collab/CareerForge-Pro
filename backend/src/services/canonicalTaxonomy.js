/**
 * Canonical Taxonomy Service
 *
 * Centralized registry for ATS canonical technical terms, categories,
 * aliases, and boundary-aware string matching.
 *
 * Part of CareerForge Pro ATS Phase 2A Hardening.
 */

export const CANONICAL_TAXONOMY = [
  // ── Technologies & Frameworks ──────────────────────────────
  {
    canonicalId: 'technology.mern',
    displayName: 'MERN Stack',
    category: 'Framework',
    aliases: ['mern', 'mern stack', 'mern-stack'],
  },
  {
    canonicalId: 'technology.mongodb',
    displayName: 'MongoDB',
    category: 'Database',
    aliases: ['mongodb', 'mongo'],
  },
  {
    canonicalId: 'technology.express',
    displayName: 'Express.js',
    category: 'Framework',
    aliases: ['express', 'express.js', 'expressjs'],
  },
  {
    canonicalId: 'technology.react',
    displayName: 'React',
    category: 'Framework',
    aliases: ['react', 'react.js', 'reactjs'],
  },
  {
    canonicalId: 'technology.nodejs',
    displayName: 'Node.js',
    category: 'Framework',
    aliases: ['node', 'node.js', 'nodejs'],
  },
  {
    canonicalId: 'technology.rest_api',
    displayName: 'REST APIs',
    category: 'Architecture',
    aliases: ['rest api', 'rest apis', 'restful api', 'restful apis', "rest api's", 'restful'],
  },
  {
    canonicalId: 'technology.jwt',
    displayName: 'JWT',
    category: 'Security',
    aliases: [
      'jwt',
      'json web token',
      'json web tokens',
      'jwt authentication',
      'jwt authentication protocols',
      'jwt protocols',
      'jwt tokens',
    ],
  },
  {
    canonicalId: 'technology.nextjs',
    displayName: 'Next.js',
    category: 'Framework',
    aliases: ['next', 'next.js', 'nextjs'],
  },
  {
    canonicalId: 'technology.redux',
    displayName: 'Redux',
    category: 'Framework',
    aliases: ['redux', 'reduxtoolkit', 'redux toolkit', 'rtk'],
  },
  {
    canonicalId: 'technology.tailwind',
    displayName: 'Tailwind CSS',
    category: 'Framework',
    aliases: ['tailwind', 'tailwindcss', 'tailwind css', 'tailwind-css'],
  },
  {
    canonicalId: 'technology.graphql',
    displayName: 'GraphQL',
    category: 'Architecture',
    aliases: ['graphql'],
  },
  {
    canonicalId: 'framework.django',
    displayName: 'Django',
    category: 'Framework',
    aliases: ['django'],
  },
  {
    canonicalId: 'framework.django_rest_framework',
    displayName: 'Django REST Framework',
    category: 'Framework',
    aliases: ['django rest framework', 'drf', 'django-rest-framework'],
    partialIndicators: [['django', 'rest api'], ['django', 'restful']],
  },
  {
    canonicalId: 'framework.dotnet',
    displayName: '.NET',
    category: 'Framework',
    aliases: ['.net', 'dotnet', 'asp.net'],
  },
  {
    canonicalId: 'framework.dotnet_core',
    displayName: '.NET Core',
    category: 'Framework',
    aliases: ['.net core', 'dotnet core', '.netcore'],
  },

  // ── Programming Languages ──────────────────────────────────
  {
    canonicalId: 'language.javascript',
    displayName: 'JavaScript',
    category: 'Programming Language',
    aliases: ['javascript', 'js', 'ecmascript'],
  },
  {
    canonicalId: 'language.typescript',
    displayName: 'TypeScript',
    category: 'Programming Language',
    aliases: ['typescript', 'ts'],
  },
  {
    canonicalId: 'language.python',
    displayName: 'Python',
    category: 'Programming Language',
    aliases: ['python', 'python3'],
  },
  {
    canonicalId: 'language.go',
    displayName: 'Go',
    category: 'Programming Language',
    aliases: ['go', 'golang'],
  },
  {
    canonicalId: 'language.c',
    displayName: 'C',
    category: 'Programming Language',
    aliases: ['c'],
  },
  {
    canonicalId: 'language.cpp',
    displayName: 'C++',
    category: 'Programming Language',
    aliases: ['c++', 'cpp'],
  },
  {
    canonicalId: 'language.csharp',
    displayName: 'C#',
    category: 'Programming Language',
    aliases: ['c#', 'c sharp', 'csharp'],
  },
  {
    canonicalId: 'language.java',
    displayName: 'Java',
    category: 'Programming Language',
    aliases: ['java'],
  },

  // ── Databases ──────────────────────────────────────────────
  {
    canonicalId: 'database.postgresql',
    displayName: 'PostgreSQL',
    category: 'Database',
    aliases: ['postgresql', 'postgres', 'psql'],
  },
  {
    canonicalId: 'database.mysql',
    displayName: 'MySQL',
    category: 'Database',
    aliases: ['mysql'],
  },
  {
    canonicalId: 'database.sql',
    displayName: 'SQL',
    category: 'Database',
    aliases: ['sql', 'relational database'],
  },

  // ── DevOps & Cloud ─────────────────────────────────────────
  {
    canonicalId: 'devops.docker',
    displayName: 'Docker',
    category: 'DevOps',
    aliases: ['docker', 'containerization', 'containers'],
  },
  {
    canonicalId: 'devops.docker_compose',
    displayName: 'Docker Compose',
    category: 'DevOps',
    aliases: ['docker compose', 'docker-compose', 'compose'],
  },
  {
    canonicalId: 'devops.kubernetes',
    displayName: 'Kubernetes',
    category: 'DevOps',
    aliases: ['kubernetes', 'k8s'],
  },
  {
    canonicalId: 'devops.cicd',
    displayName: 'CI/CD',
    category: 'DevOps',
    // 'pipelines' removed – too broad; data/graphics pipelines are unrelated to CI/CD.
    aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous delivery', 'ci / cd', 'ci/cd pipelines', 'deployment pipelines'],
  },
  {
    canonicalId: 'cloud.aws',
    displayName: 'AWS',
    category: 'Cloud',
    aliases: ['aws', 'amazon web services'],
  },
  {
    canonicalId: 'cloud.gcp',
    displayName: 'GCP',
    category: 'Cloud',
    aliases: ['gcp', 'google cloud', 'google cloud platform'],
  },
  {
    canonicalId: 'cloud.azure',
    displayName: 'Azure',
    category: 'Cloud',
    aliases: ['azure', 'microsoft azure'],
  },

  // ── Testing & Tools ────────────────────────────────────────
  {
    canonicalId: 'testing.jest',
    displayName: 'Jest',
    category: 'Testing',
    aliases: ['jest', 'unit testing'],
  },
  {
    canonicalId: 'testing.cypress',
    displayName: 'Cypress',
    category: 'Testing',
    aliases: ['cypress', 'e2e testing', 'integration testing'],
  },
  {
    canonicalId: 'tools.git',
    displayName: 'Git',
    category: 'Tools',
    aliases: ['git', 'github', 'version control'],
  },

  // ── Architecture & Conceptual Requirements ─────────────────
  {
    canonicalId: 'concept.application_security',
    displayName: 'Application Security',
    category: 'Security',
    aliases: ['application security', 'appsec', 'app security'],
    partialIndicators: [
      'secure auth',
      'jwt authentication',
      'authentication and authorization',
      'data encryption',
      'oauth',
      'security protocols',
      'secure authentication',
      'secure jwt-based authentication',
    ],
  },
  {
    canonicalId: 'concept.session_tracking',
    displayName: 'Session Tracking',
    category: 'Architecture',
    aliases: ['session tracking', 'session management', 'sessions', 'session handling'],
    // 'cookies' removed – too broad; generic cookie usage doesn't prove server-side session tracking.
    partialIndicators: ['session storage', 'token management', 'stateless sessions', 'session data'],
  },
  {
    canonicalId: 'concept.system_architecture',
    displayName: 'Modern System Architecture',
    category: 'Architecture',
    aliases: [
      'modern system architectures',
      'modern system architecture',
      'system architecture',
      'system architectures',
      'systems architecture',
      'software architecture',
    ],
    partialIndicators: [
      'microservices',
      'distributed systems',
      'event-driven',
      'system design',
      // 'scalable software solutions' removed – generic resume filler, not evidence of architecture work.
      'scalable architecture',
    ],
  },
  {
    canonicalId: 'concept.backend_server_processes',
    displayName: 'Backend Server Processes',
    category: 'Architecture',
    aliases: [
      'backend server processes',
      'backend processes',
      'server processes',
      'background processes',
    ],
    partialIndicators: [
      'background queue',
      'worker processes',
      'message queue',
      'queue workers',
      'cron jobs',
      'background tasks',
      // 'backend systems' removed – too generic, doesn't prove server process impl.
      // 'backend performance' removed – performance optimization ≠ background server processes.
    ],
  },
  {
    canonicalId: 'concept.deployment',
    displayName: 'Deployment',
    category: 'DevOps',
    aliases: ['deployment', 'deploying', 'deploy', 'production deployment'],
    partialIndicators: ['docker', 'ci/cd', 'render', 'vercel', 'aws', 'gcp', 'hosting'],
  },

  // ── Soft Skills ────────────────────────────────────────────
  {
    canonicalId: 'soft_skill.communication',
    displayName: 'Communication',
    category: 'SoftSkill',
    aliases: ['communication', 'written communication', 'verbal communication'],
  },
  {
    canonicalId: 'soft_skill.leadership',
    displayName: 'Leadership',
    category: 'SoftSkill',
    aliases: ['leadership', 'team leadership', 'mentorship', 'mentoring'],
  },
  {
    canonicalId: 'soft_skill.teamwork',
    displayName: 'Teamwork',
    category: 'SoftSkill',
    aliases: ['teamwork', 'collaboration', 'collaborative'],
  },
  {
    canonicalId: 'soft_skill.problem_solving',
    displayName: 'Problem Solving',
    category: 'SoftSkill',
    aliases: ['problem solving', 'problem-solving', 'analytical skills'],
  },
  {
    canonicalId: 'soft_skill.agile',
    displayName: 'Agile',
    category: 'SoftSkill',
    aliases: ['agile', 'scrum', 'kanban'],
  },
];

/**
 * Fast lookup indexes for canonical registry
 */
const ALIAS_INDEX = new Map();
const ID_INDEX = new Map();

for (const entry of CANONICAL_TAXONOMY) {
  ID_INDEX.set(entry.canonicalId, entry);

  // Map displayName (lowercased)
  const normDisplay = entry.displayName.toLowerCase().trim();
  ALIAS_INDEX.set(normDisplay, entry);

  // Map all explicit aliases
  for (const alias of entry.aliases) {
    const normAlias = alias.toLowerCase().trim();
    ALIAS_INDEX.set(normAlias, entry);
  }
}

/**
 * Boundary-aware term matcher that prevents false substring matches
 * (e.g. MongoDB -> Go, C++ -> C, etc.)
 */
export function checkTermMatch(term, text) {
  if (!term || !text) return false;
  const cleanTerm = term.toLowerCase().trim();
  const cleanText = text.toLowerCase();

  if (!cleanTerm || !cleanText) return false;

  // Guard 1: Single letter 'c' must NOT match inside 'c++' or 'c#'
  if (cleanTerm === 'c') {
    return /\bc(?![+#])\b/i.test(cleanText);
  }

  // Guard 2: 'js' must NOT match inside framework/runtime names ending with .js (e.g. Node.js, Express.js)
  if (cleanTerm === 'js') {
    const withoutFrameworks = cleanText.replace(/\b[a-z0-9_]+\.js\b/gi, ' ');
    return /\bjs\b/i.test(withoutFrameworks);
  }

  // Guard 2: Term is purely alphanumeric with spaces
  const isAlphaNumericOnly = /^[a-z0-9\s]+$/i.test(cleanTerm);

  if (isAlphaNumericOnly) {
    const escaped = cleanTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(cleanText);
  } else {
    // Non-alphanumeric term (e.g. 'c++', 'c#', 'ci/cd', '.net', '.net core', 'node.js')
    let idx = cleanText.indexOf(cleanTerm);
    while (idx !== -1) {
      const charBefore = idx > 0 ? cleanText[idx - 1] : ' ';
      const charAfter = idx + cleanTerm.length < cleanText.length ? cleanText[idx + cleanTerm.length] : ' ';

      const startsWithAlpha = /[a-z0-9]/i.test(cleanTerm[0]);
      const endsWithAlpha = /[a-z0-9]/i.test(cleanTerm[cleanTerm.length - 1]);

      const isBeforeBoundary = !startsWithAlpha || !/[a-z0-9]/i.test(charBefore);
      const isAfterBoundary = !endsWithAlpha || !/[a-z0-9]/i.test(charAfter);

      let extraBoundary = true;
      if (cleanTerm === 'c++' && charAfter === '+') extraBoundary = false;

      if (isBeforeBoundary && isAfterBoundary && extraBoundary) {
        return true;
      }
      idx = cleanText.indexOf(cleanTerm, idx + 1);
    }
    return false;
  }
}

/**
 * Generic filler phrases that should never be registered as custom technical skills
 */
const GENERIC_FILLER_PHRASES = new Set([
  'full stack web applications',
  'full-stack web applications',
  'full stack web application',
  'full-stack web application',
  'full stack web development',
  'full-stack web development',
  'web applications',
  'web application',
  'web platforms',
  'next generation web platforms',
  'next-generation web platforms',
  'software applications',
]);

/**
 * Strips common conversational and qualitative wrapper prefixes/suffixes from
 * LLM-extracted terms to normalize them before taxonomy lookup.
 * e.g. "deployment familiarity" -> "deployment"
 *      "understanding of application security" -> "application security"
 */
export function normalizeConversationalWrapper(term) {
  if (!term || typeof term !== 'string') return '';
  let cleaned = term.toLowerCase().trim();

  // Strip conversational prefix patterns
  const prefixRegex = /^(proven\s+)?(professional\s+)?(hands[- ]on\s+)?(strong\s+)?(deep\s+)?(solid\s+)?(understanding\s+of|knowledge\s+of|experience\s+(with|in|utilizing|building|designing)|familiarity\s+with|proficiency\s+in|working\s+knowledge\s+of|ability\s+to|skilled\s+in|expertise\s+in)\s+/i;
  cleaned = cleaned.replace(prefixRegex, '').trim();

  // Strip conversational suffix patterns
  const suffixRegex = /\s+(familiarity|experience|knowledge|proficiency|understanding|protocols?|principles?)$/i;
  if (suffixRegex.test(cleaned)) {
    const candidate = cleaned.replace(suffixRegex, '').trim();
    if (candidate.length >= 2) {
      cleaned = candidate;
    }
  }

  return cleaned;
}

/**
 * Resolves a raw term into a canonical entity.
 * If the term matches the taxonomy, returns the registered entry.
 * If unknown, creates a deterministic custom canonical representation.
 */
export function canonicalizeTerm(rawTerm) {
  if (!rawTerm || typeof rawTerm !== 'string') {
    return null;
  }

  const clean = rawTerm.toLowerCase().trim();
  if (!clean) return null;

  // 1. Direct alias index lookup
  if (ALIAS_INDEX.has(clean)) {
    return { ...ALIAS_INDEX.get(clean), isCustom: false };
  }

  // 2. Handle common trailing punctuation or suffixes (e.g. "React.js," or "JWT:")
  const stripped = clean.replace(/^[^\w.#+]+|[^\w.#+]+$/g, '');
  if (ALIAS_INDEX.has(stripped)) {
    return { ...ALIAS_INDEX.get(stripped), isCustom: false };
  }

  // 3. Conversational wrapper normalization (e.g. "deployment familiarity" -> "deployment")
  const normalized = normalizeConversationalWrapper(clean);
  if (normalized && ALIAS_INDEX.has(normalized)) {
    return { ...ALIAS_INDEX.get(normalized), isCustom: false };
  }

  const normalizedStripped = normalized ? normalized.replace(/^[^\w.#+]+|[^\w.#+]+$/g, '') : '';
  if (normalizedStripped && ALIAS_INDEX.has(normalizedStripped)) {
    return { ...ALIAS_INDEX.get(normalizedStripped), isCustom: false };
  }

  // 4. Suppress generic non-technical filler phrases from becoming custom requirements
  if (GENERIC_FILLER_PHRASES.has(clean) || (normalized && GENERIC_FILLER_PHRASES.has(normalized))) {
    return null;
  }

  // 5. Deterministic custom canonical representation for unlisted terms
  const cleanId = (normalized || clean).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const formattedDisplay = rawTerm.trim().replace(/\s+/g, ' ');

  return {
    canonicalId: `custom.${cleanId || 'term'}`,
    displayName: formattedDisplay,
    category: 'Technology',
    aliases: [clean],
    partialIndicators: [],
    isCustom: true,
  };
}

/**
 * Extracts requirement-bearing text blocks from a Job Description to ensure
 * deterministic grounding only operates on actual candidate requirements.
 */
export function extractRequirementSections(jdText) {
  if (!jdText || typeof jdText !== 'string') {
    return { requiredText: '', preferredText: '', allRequirementText: '' };
  }

  const lines = jdText.split(/\r?\n/);
  const requiredLines = [];
  const preferredLines = [];
  let currentSection = null; // 'required' | 'preferred' | 'other'

  const requiredHeaderRegex = /^\s*(requirements?|qualifications?|what you('?ll)? need|what we('?re)? looking for|must[- ]haves?|required skills?|minimum qualifications?|core responsibilities)\b[:\s-]*$/i;
  const preferredHeaderRegex = /^\s*(preferred(\s+qualifications?)?|nice[- ]to[- ]haves?|bonus(\s+points?)?|optional|desired(\s+skills?)?)\b[:\s-]*$/i;
  const otherHeaderRegex = /^\s*(about (us|the company)|who we are|benefits|what we offer|perks|compensation|overview|summary)\b[:\s-]*$/i;

  let foundExplicitHeaders = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (requiredHeaderRegex.test(trimmed)) {
      currentSection = 'required';
      foundExplicitHeaders = true;
      continue;
    } else if (preferredHeaderRegex.test(trimmed)) {
      currentSection = 'preferred';
      foundExplicitHeaders = true;
      continue;
    } else if (otherHeaderRegex.test(trimmed)) {
      currentSection = 'other';
      foundExplicitHeaders = true;
      continue;
    }

    if (currentSection === 'required') {
      requiredLines.push(trimmed);
    } else if (currentSection === 'preferred') {
      preferredLines.push(trimmed);
    }
  }

  // If no explicit section headers were found, look for bullet points
  if (!foundExplicitHeaders) {
    const bulletLines = lines
      .map(l => l.trim())
      .filter(l => /^[-*•\d.]\s+/.test(l));

    if (bulletLines.length > 0) {
      return {
        requiredText: bulletLines.join('\n'),
        preferredText: '',
        allRequirementText: bulletLines.join('\n'),
      };
    }

    // Fallback: whole text
    return {
      requiredText: jdText,
      preferredText: '',
      allRequirementText: jdText,
    };
  }

  return {
    requiredText: requiredLines.join('\n'),
    preferredText: preferredLines.join('\n'),
    allRequirementText: [...requiredLines, ...preferredLines].join('\n'),
  };
}

/**
 * Scans requirement-bearing text against CANONICAL_TAXONOMY using boundary-aware term matching.
 * Guarantees that any canonical concept explicitly present in the JD requirements is included.
 */
export function groundTaxonomyRequirements(requirementText, canonicalMap, tier = 'REQUIRED') {
  if (!requirementText || typeof requirementText !== 'string' || !requirementText.trim()) {
    return;
  }

  for (const entry of CANONICAL_TAXONOMY) {
    let isPresent = false;

    // Check displayName first
    if (checkTermMatch(entry.displayName, requirementText)) {
      isPresent = true;
    }

    // If not matched by displayName, check each alias
    if (!isPresent && Array.isArray(entry.aliases)) {
      for (const alias of entry.aliases) {
        if (checkTermMatch(alias, requirementText)) {
          isPresent = true;
          break;
        }
      }
    }

    if (isPresent) {
      if (canonicalMap.has(entry.canonicalId)) {
        const existing = canonicalMap.get(entry.canonicalId);
        // Elevate to REQUIRED if detected in required requirement context
        if (tier === 'REQUIRED' && existing.tier !== 'REQUIRED') {
          existing.tier = 'REQUIRED';
        }
      } else {
        canonicalMap.set(entry.canonicalId, {
          canonicalId: entry.canonicalId,
          displayName: entry.displayName,
          category: entry.category,
          tier: tier,
          rawTerms: [entry.displayName],
          aliases: entry.aliases || [entry.displayName.toLowerCase()],
          partialIndicators: entry.partialIndicators || [],
          isCustom: false,
        });
      }
    }
  }
}

/**
 * Normalizes and collects canonical requirements from JD analysis fields
 * with deterministic grounding against requirement-bearing JD text.
 */
export function collectCanonicalRequirements(jdAnalysis, rawJdText = null) {
  if (!jdAnalysis || typeof jdAnalysis !== 'object') {
    return [];
  }

  const normalizeList = (list) =>
    (list || [])
      .map(k => (typeof k === 'string' ? k.trim() : ''))
      .filter(k => k.length > 0);

  const required = normalizeList(jdAnalysis.requiredKeywords);
  const preferred = normalizeList(jdAnalysis.preferredKeywords);
  const soft = normalizeList(jdAnalysis.softSkills);
  const tech = normalizeList(jdAnalysis.technologies);
  const certs = normalizeList(jdAnalysis.certifications);

  // Sets for context-aware membership checks
  const requiredSet = new Set(required.map(t => t.toLowerCase()));
  const preferredSet = new Set(preferred.map(t => t.toLowerCase()));

  const canonicalMap = new Map();

  function processTerm(term, tier, defaultCategory) {
    const canon = canonicalizeTerm(term);
    if (!canon) return;

    if (canonicalMap.has(canon.canonicalId)) {
      const existing = canonicalMap.get(canon.canonicalId);
      // Rule: REQUIRED tier strictly wins over PREFERRED
      if (tier === 'REQUIRED' && existing.tier !== 'REQUIRED') {
        existing.tier = 'REQUIRED';
      }
      if (!existing.rawTerms.includes(term)) {
        existing.rawTerms.push(term);
      }
    } else {
      canonicalMap.set(canon.canonicalId, {
        canonicalId: canon.canonicalId,
        displayName: canon.displayName,
        category: canon.category || defaultCategory || 'Technology',
        tier: tier,
        rawTerms: [term],
        aliases: canon.aliases || [term.toLowerCase()],
        partialIndicators: canon.partialIndicators || [],
        isCustom: canon.isCustom || false,
      });
    }
  }

  // 1. Process explicit required skills
  required.forEach(t => processTerm(t, 'REQUIRED', 'Technology'));

  // 2. Process certifications (default to REQUIRED)
  certs.forEach(t => processTerm(t, 'REQUIRED', 'Certification'));

  // 3. Process technologies without blindly forcing REQUIRED:
  //    If term is explicitly in preferredKeywords (and NOT in requiredKeywords), tier is PREFERRED.
  tech.forEach(t => {
    const lower = t.toLowerCase();
    const isExplicitlyPreferred = preferredSet.has(lower) && !requiredSet.has(lower);
    const techTier = isExplicitlyPreferred ? 'PREFERRED' : 'REQUIRED';
    processTerm(t, techTier, 'Technology');
  });

  // 4. Process soft skills (default to PREFERRED)
  soft.forEach(t => processTerm(t, 'PREFERRED', 'SoftSkill'));

  // 5. Process preferred skills
  preferred.forEach(t => processTerm(t, 'PREFERRED', 'Technology'));

  // 6. Deterministic JD Grounding Pass
  // Extract requirement context from raw JD text if available
  const jdText = rawJdText || jdAnalysis.rawText || '';
  if (jdText) {
    const sections = extractRequirementSections(jdText);
    if (sections.requiredText) {
      groundTaxonomyRequirements(sections.requiredText, canonicalMap, 'REQUIRED');
    }
    if (sections.preferredText) {
      groundTaxonomyRequirements(sections.preferredText, canonicalMap, 'PREFERRED');
    }
  }

  return Array.from(canonicalMap.values());
}

/**
 * Checks if a category belongs to technical skills
 */
export function isTechCategory(category) {
  return [
    'Technology',
    'Framework',
    'Programming Language',
    'Database',
    'Cloud',
    'DevOps',
    'Architecture',
    'Security',
    'Testing',
    'Tools',
  ].includes(category);
}
