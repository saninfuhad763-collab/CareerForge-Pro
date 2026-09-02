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
    aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous delivery', 'ci / cd', 'pipelines'],
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
    partialIndicators: ['cookies', 'session storage', 'token management', 'stateless sessions', 'session data'],
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
      'scalable software solutions',
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
      'backend systems',
      'backend performance',
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

  // Direct alias index lookup
  if (ALIAS_INDEX.has(clean)) {
    return { ...ALIAS_INDEX.get(clean), isCustom: false };
  }

  // Handle common trailing punctuation or suffixes (e.g. "React.js," or "JWT:")
  const stripped = clean.replace(/^[^\w.#+]+|[^\w.#+]+$/g, '');
  if (ALIAS_INDEX.has(stripped)) {
    return { ...ALIAS_INDEX.get(stripped), isCustom: false };
  }

  // Deterministic custom canonical representation for unlisted terms
  const cleanId = clean.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
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
 * Normalizes and collects canonical requirements from JD analysis fields
 */
export function collectCanonicalRequirements(jdAnalysis) {
  const normalizeList = (list) =>
    (list || [])
      .map(k => (typeof k === 'string' ? k.trim() : ''))
      .filter(k => k.length > 0);

  const required = normalizeList(jdAnalysis.requiredKeywords);
  const preferred = normalizeList(jdAnalysis.preferredKeywords);
  const soft = normalizeList(jdAnalysis.softSkills);
  const tech = normalizeList(jdAnalysis.technologies);
  const certs = normalizeList(jdAnalysis.certifications);

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

  // Process in priority order
  required.forEach(t => processTerm(t, 'REQUIRED', 'Technology'));
  tech.forEach(t => processTerm(t, 'REQUIRED', 'Technology'));
  certs.forEach(t => processTerm(t, 'REQUIRED', 'Certification'));
  soft.forEach(t => processTerm(t, 'PREFERRED', 'SoftSkill'));
  preferred.forEach(t => processTerm(t, 'PREFERRED', 'Technology'));

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
