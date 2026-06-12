import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitions, slideUp } from '../animations/pageTransitions';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FileText, 
  Award, 
  Globe, 
  FolderGit2, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ExternalLink,
  Laptop,
  Sparkles,
  Brain,
  Check,
  RotateCcw,
  X,
  Target,
  Loader2,
  Lightbulb,
  Palette,
  Download,
  Upload
} from 'lucide-react';

const normalizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const JD_PRESETS = {
  "mern": {
    title: "MERN Stack Developer",
    jdText: `We are seeking a high-caliber MERN Stack Developer to design, build, and deploy next-generation web platforms. \n\nRequirements:\n- Proven professional experience building full-stack web applications utilizing the MERN stack: MongoDB, Express, React, and Node.js.\n- Strong proficiency in building robust, high-performance REST APIs.\n- Deep understanding of application security, session tracking, and JWT authentication protocols.\n- Hands-on deployment familiarity with modern system architectures and backend server processes.`,
    score: 55,
    breakdown: {
      missingKeywords: ["MongoDB", "Express", "Node.js", "JWT", "REST APIs"],
      matchedKeywords: ["React", "JavaScript", "HTML5", "CSS3"],
      recommendations: [
        "Detail experience setting up and configuring Express middleware and server routing.",
        "Incorporate MongoDB collections design, query structures, or index optimizations.",
        "Describe building microservices and REST APIs using Node.js.",
        "Highlight stateless authentication mechanisms using JWT."
      ],
      metrics: {
        keywordMatch: 45,
        skillsCoverage: 50,
        experienceRelevance: 48,
        formattingScore: 90
      }
    }
  },
  "frontend": {
    title: "Frontend Developer",
    jdText: `We are looking for a skilled Frontend Developer to join our core product team. You will lead user interface design and implement robust, component-driven client applications.\n      \nKey Requirements:\n- Deep expertise with JavaScript and TypeScript.\n- Strong development experience building responsive SPA architectures with React.\n- Practical experience integrating REST APIs and handling modern asynchronous state paradigms.\n- Solid understanding of Git version control workflows and collaborative development.\n- Exceptional eye for Responsive Design, accessibility standards, and clean semantic structures.`,
    score: 65,
    breakdown: {
      missingKeywords: ["TypeScript", "Responsive Design", "REST APIs", "Git"],
      matchedKeywords: ["React", "JavaScript", "HTML5", "CSS3"],
      recommendations: [
        "Incorporate TypeScript type safety features into your recent engineering bullets.",
        "Explicitly detail your work with Responsive Design and media queries.",
        "Describe how you consume REST APIs and handle HTTP status/error states.",
        "Highlight collaborative git-flow processes in your project definitions."
      ],
      metrics: {
        keywordMatch: 50,
        skillsCoverage: 60,
        experienceRelevance: 55,
        formattingScore: 90
      }
    }
  },
  "software_engineer": {
    title: "Software Engineer",
    jdText: `We are looking for a Software Engineer to join our core engineering unit to build reliable, high-performance backend systems.\n\nCore Competencies:\n- Masterful command of Data Structures and core Computer Science Algorithms.\n- Strong architectural grasp of modern distributed System Design, scalability principles, and message queues.\n- Professional experience applying OOP (Object-Oriented Programming) design patterns.\n- High QA standards with thorough experience in automated unit, integration, and regression Testing.`,
    score: 40,
    breakdown: {
      missingKeywords: ["Data Structures", "Algorithms", "System Design", "OOP", "Testing"],
      matchedKeywords: ["JavaScript", "Git"],
      recommendations: [
        "Mention your optimization work involving complex Data Structures and Algorithms.",
        "Incorporate system design diagrams or distributed system scaling features in your project summaries.",
        "Highlight software engineering principles like OOP and solid SOLID design patterns.",
        "Add details about writing automated unit and integration Testing suites."
      ],
      metrics: {
        keywordMatch: 35,
        skillsCoverage: 40,
        experienceRelevance: 38,
        formattingScore: 85
      }
    }
  },
  "product_manager": {
    title: "Product Manager",
    jdText: `We are hiring a Product Manager to guide product development cycles, define key milestones, and launch impactful user solutions.\n\nRequirements:\n- Deep expertise defining high-impact Product Strategy and market positioning.\n- Professional leadership skills mapping out product visions and cross-functional Roadmapping.\n- Excellent execution standards utilizing Agile methodologies (Scrum/Kanban).\n- Outstanding Stakeholder Management capabilities, aligning designers, engineering teams, and executive leaders.\n- Data-driven mindset using system Analytics and behavioral reporting dashboards to measure success.`,
    score: 35,
    breakdown: {
      missingKeywords: ["Product Strategy", "Roadmapping", "Agile", "Stakeholder Management", "Analytics"],
      matchedKeywords: ["React", "Git"],
      recommendations: [
        "Add product lifecycle accomplishments defining Product Strategy.",
        "Detail your planning and execution workflows with product Roadmapping.",
        "Emphasize Agile product management skills and cross-functional team alignment.",
        "Incorporate Stakeholder Management achievements and business Analytics metrics."
      ],
      metrics: {
        keywordMatch: 30,
        skillsCoverage: 32,
        experienceRelevance: 30,
        formattingScore: 88
      }
    }
  },
  "data_analyst": {
    title: "Data Analyst",
    jdText: `We are seeking a talented Data Analyst to transform complex information sets into clear, actionable business strategies.\n\nKey Skills:\n- Advanced SQL capability to query databases, write complex joins, and optimize execution speeds.\n- Proficient analytical programming skills using Python for data cleaning, transformation, and statistical models.\n- Mastery of Excel features including pivot tables, lookup functions, and macro automations.\n- Deep experience design-building interactive business intelligence reports with Power BI.\n- Exceptional Data Visualization skills to translate technical results into comprehensive stories for executive leaders.`,
    score: 30,
    breakdown: {
      missingKeywords: ["SQL", "Python", "Excel", "Power BI", "Data Visualization"],
      matchedKeywords: ["Git"],
      recommendations: [
        "Inject quantitative skills using SQL querying and database schemas into your experience.",
        "Mention your Python analytical scripts and quantitative data modeling experience.",
        "Include Excel workflow enhancements or macro scripts.",
        "Highlight business intelligence dash design with Power BI and general Data Visualization standards."
      ],
      metrics: {
        keywordMatch: 25,
        skillsCoverage: 28,
        experienceRelevance: 26,
        formattingScore: 80
      }
    }
  }
};

const Builder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOptimizeMode = searchParams.get('mode') === 'optimize';
  const { 
    currentResume, 
    loadResumeById, 
    updateResumeLocal, 
    saveResumeImmediately, 
    saving, 
    loading, 
    error,
    autoSaveEnabled,
    setAutoSaveEnabled,
    hasUnsavedChanges
  } = useResumeStore();

  const [activeAccordion, setActiveAccordion] = useState('personal');
  const [saveStatus, setSaveStatus] = useState('Saved to cloud');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('modern');
  const [isPrinting, setIsPrinting] = useState(false);
  const [manualSavePerformed, setManualSavePerformed] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    if (currentResume?.templateId) {
      setActiveTheme(currentResume.templateId);
    }
  }, [currentResume?.templateId]);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // State abstractions for JD ATS Check & AI Optimization
  const [jdText, setJdText] = useState('');
  const [isJdAnalyzing, setIsJdAnalyzing] = useState(false);
  const [atsBreakdown, setAtsBreakdown] = useState(null);
  const [isJdOpen, setIsJdOpen] = useState(true);

  // Live Demo, Confetti, & ATS Modal States
  const [demoModeActive, setDemoModeActive] = useState(false);
  const [selectedJdPreset, setSelectedJdPreset] = useState('');
  const [analyzedJdPreset, setAnalyzedJdPreset] = useState('');
  const [analyzedJdText, setAnalyzedJdText] = useState('');
  const [showAtsReportModal, setShowAtsReportModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(50);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [modalKeywordSearch, setModalKeywordSearch] = useState('');
  // ATS Matcher error state — shows inline error inside the ATS panel (no browser alerts)
  const [atsError, setAtsError] = useState(null);
  const [atsPhase, setAtsPhase] = useState('');

  // Preset loading pipeline: ONLY populates state, does NOT trigger ATS analysis
  const handlePresetChange = (val) => {
    setSelectedJdPreset(val);
    if (val && JD_PRESETS[val]) {
      setJdText(JD_PRESETS[val].jdText);
    } else {
      setJdText('');
    }
  };

  // Reusable keyword matching engine utilities
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

  const isKeywordMatched = (keyword, compiledResumeText) => {
    const cleanKw = keyword.toLowerCase().trim();
    if (!cleanKw) return false;

    const aliases = ALIAS_MAP[cleanKw] || [cleanKw];

    if (aliases.some(alias => checkSingleTermMatch(alias, compiledResumeText))) {
      return true;
    }

    if (cleanKw.includes(' ') || cleanKw.includes('-')) {
      const words = cleanKw.split(/[\s\-._]+/).filter(w => w.length > 3);
      if (words.length > 1) {
        return words.every(word => checkSingleTermMatch(word, compiledResumeText));
      }
    }

    return false;
  };

  const compileResumeText = (res) => {
    if (!res) return '';
    const parts = [];
    if (res.title) parts.push(res.title);
    if (res.summary) parts.push(res.summary);
    if (res.personalInfo) {
      const p = res.personalInfo;
      parts.push(p.fullName || '', p.location || '');
    }
    if (res.experience && Array.isArray(res.experience)) {
      res.experience.forEach(exp => {
        parts.push(exp.company || '', exp.position || '', exp.description || '');
      });
    }
    if (res.education && Array.isArray(res.education)) {
      res.education.forEach(edu => {
        parts.push(edu.school || '', edu.degree || '', edu.fieldOfStudy || '', edu.description || '');
      });
    }
    if (res.skills && Array.isArray(res.skills)) {
      res.skills.forEach(s => {
        parts.push(s.name || '');
        if (s.keywords && Array.isArray(s.keywords)) {
          parts.push(...s.keywords);
        }
      });
    }
    if (res.projects && Array.isArray(res.projects)) {
      res.projects.forEach(p => {
        parts.push(p.title || '', p.role || '', p.description || '');
      });
    }
    if (res.certifications && Array.isArray(res.certifications)) {
      res.certifications.forEach(c => {
        parts.push(c.name || '', c.issuer || '');
      });
    }
    if (res.languages && Array.isArray(res.languages)) {
      res.languages.forEach(l => {
        parts.push(l.language || '', l.proficiency || '');
      });
    }
    return parts.join(' ');
  };

  const getTargetKeywords = () => {
    const meta = currentResume?.atsMetadata;
    if (meta?.lastJdHash) {
      const found = meta.keywordsFound || [];
      const missing = meta.keywordsMissing || [];
      return [...new Set([...found, ...missing])];
    }
    return [];
  };

  const dynamicAtsData = useMemo(() => {
    const meta = currentResume?.atsMetadata;
    if (!currentResume || !meta?.lastJdHash) {
      return {
        matchedKeywords: [],
        missingKeywords: [],
        score: 0,
        keywordMatchPercent: 0,
        density: {},
        feedback: []
      };
    }

    const compiledResumeText = compileResumeText(currentResume);
    const targetKeywords = getTargetKeywords();

    const matched = [];
    const missing = [];

    targetKeywords.forEach(kw => {
      if (isKeywordMatched(kw, compiledResumeText)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const uniqueMatched = [...new Set(matched)];
    const uniqueMissing = [...new Set(missing)].filter(k => !uniqueMatched.includes(k));

    const totalCount = uniqueMatched.length + uniqueMissing.length;
    const keywordMatchPercent = totalCount > 0 ? Math.round((uniqueMatched.length / totalCount) * 100) : 0;

    const density = {};
    const normalizedResume = compiledResumeText.toLowerCase();
    uniqueMatched.forEach(kw => {
      const regex = new RegExp(kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      const matches = normalizedResume.match(regex);
      density[kw] = matches ? matches.length : 1;
    });

    return {
      matchedKeywords: uniqueMatched,
      missingKeywords: uniqueMissing,
      keywordMatchPercent,
      score: meta.score || 0,
      density,
      feedback: meta.feedback || []
    };
  }, [currentResume]);

  // Destructure resume sections with fallbacks
  const {
    title = '',
    templateId: storeTemplateId = 'modern',
    sectionOrder = [],
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    certifications = [],
    projects = [],
    languages = [],
    atsMetadata = { score: 0, feedback: [] }
  } = currentResume || {};

  const templateId = activeTheme;

  const activeAtsScore = currentResume?.atsMetadata?.lastJdHash ? (currentResume.atsMetadata.score || 0) : 0;
  const initialAtsScore = currentResume?.atsMetadata?.initialScore !== undefined ? currentResume.atsMetadata.initialScore : activeAtsScore;
  const optimizedAtsScore = currentResume?.atsMetadata?.optimizedScore || 0;
  const scoreImprovement = currentResume?.atsMetadata?.scoreImprovement || 0;
  const hasOptimization = currentResume?.atsMetadata?.lastJdHash && (optimizedAtsScore > 0);

  const safeAtsMetadata = {
    score: activeAtsScore,
    feedback: currentResume?.atsMetadata?.feedback || []
  };

  const totalContentCount = useMemo(() => {
    let count = 0;
    if (summary) count += 1;
    if (experience && experience.length > 0) count += experience.length;
    if (education && education.length > 0) count += education.length;
    if (skills && skills.length > 0) count += skills.length;
    if (projects && projects.length > 0) count += projects.length;
    if (certifications && certifications.length > 0) count += certifications.length;
    if (languages && languages.length > 0) count += languages.length;
    return count;
  }, [summary, experience, education, skills, projects, certifications, languages]);

  const dynamicStyles = useMemo(() => {
    if (totalContentCount <= 2) {
      return {
        sectionSpace: 'space-y-7',
        itemSpace: 'space-y-3',
        sheetPadding: 'p-8 md:p-12',
        skillsListSpace: 'space-y-2.5',
        expListSpace: 'space-y-4',
        projListSpace: 'space-y-4',
        eduListSpace: 'space-y-4',
        headingMargin: 'mb-2.5',
        sectionMargin: 'mt-7'
      };
    } else if (totalContentCount <= 4) {
      return {
        sectionSpace: 'space-y-6',
        itemSpace: 'space-y-2.5',
        sheetPadding: 'p-8 md:p-12',
        skillsListSpace: 'space-y-2',
        expListSpace: 'space-y-3.5',
        projListSpace: 'space-y-3',
        eduListSpace: 'space-y-3',
        headingMargin: 'mb-2',
        sectionMargin: 'mt-6'
      };
    } else if (totalContentCount <= 6) {
      return {
        sectionSpace: 'space-y-5',
        itemSpace: 'space-y-2',
        sheetPadding: 'p-7 md:p-10',
        skillsListSpace: 'space-y-1.5',
        expListSpace: 'space-y-3',
        projListSpace: 'space-y-2.5',
        eduListSpace: 'space-y-2.5',
        headingMargin: 'mb-1.5',
        sectionMargin: 'mt-5'
      };
    } else {
      return {
        sectionSpace: 'space-y-4',
        itemSpace: 'space-y-1.5',
        sheetPadding: 'p-6 md:p-8',
        skillsListSpace: 'space-y-1',
        expListSpace: 'space-y-2',
        projListSpace: 'space-y-1.5',
        eduListSpace: 'space-y-1.5',
        headingMargin: 'mb-1',
        sectionMargin: 'mt-4'
      };
    }
  }, [totalContentCount]);

  // Magic Optimizer State
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [optimizerType, setOptimizerType] = useState('summary'); // 'summary' | 'bullet'
  const [originalText, setOriginalText] = useState('');
  const [optimizedText, setOptimizedText] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [magicPromptType, setMagicPromptType] = useState('summary_rewrite');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [currentLogId, setCurrentLogId] = useState(null);
  const [onApplyCallback, setOnApplyCallback] = useState(null);
  const [activeAbortController, setActiveAbortController] = useState(null);
  const [localSkillsText, setLocalSkillsText] = useState({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedResumeFile, setSelectedResumeFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isImportingResume, setIsImportingResume] = useState(false);

  // History & Plan Stats
  const [planStats, setPlanStats] = useState({ plan: 'FREE', aiRewriteCount: 0, resumeCount: 1, resumeLimit: 1, aiLimit: 10 });
  const [historyLogs, setHistoryLogs] = useState([]);

  // Fetch plan stats on load
  const fetchPlanStats = async () => {
    try {
      const response = await fetch(`${API_URL}/ai/plan-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cf_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPlanStats(data);
      }
    } catch (e) {
      console.error('Failed to load plan stats:', e);
    }
  };

  const fetchHistoryLogs = async () => {
    if (!id) return;
    try {
      const response = await fetch(`${API_URL}/ai/history/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cf_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistoryLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to load history logs:', e);
    }
  };

  useEffect(() => {
    fetchPlanStats();
    fetchHistoryLogs();
  }, [id]);

  // Set initial animatedScore when resume loads
  useEffect(() => {
    if (activeAtsScore) {
      setAnimatedScore(activeAtsScore);
    } else {
      setAnimatedScore(0);
    }
  }, [activeAtsScore]);

  // Animate score counter changes smoothly
  useEffect(() => {
    const targetScore = activeAtsScore;
    let start = animatedScore;
    const end = targetScore;
    if (start === end) return;
    const duration = 1000;
    const range = end - start;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setAnimatedScore(Math.floor(start + progress * range));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [activeAtsScore]);

  // Self-closing Confetti system
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Load Demo Data Action
  const loadDemoData = () => {
    setDemoModeActive(true);
    updateResumeLocal({
      title: "Demo Resume - Senior Frontend Developer",
      templateId: "modern",
      personalInfo: {
        fullName: "Alex Rivera",
        email: "alex.rivera@devmail.io",
        phone: "+1 (415) 889-2341",
        location: "San Francisco, CA",
        website: "rivera.dev",
        github: "github.com/alexriveradev",
        linkedin: "linkedin.com/in/alex-rivera-frontend"
      },
      summary: "Results-driven Senior Frontend Engineer with 5+ years of experience designing and scaling web architectures. Expert in building modern React applications, optimizing performance to sub-second load times, and spearheading state management pipelines. Passionate about pixel-perfect responsive layouts and technical mentorship.",
      experience: [
        {
          company: "TechNova Solutions",
          position: "Senior Frontend Engineer",
          location: "San Francisco, CA",
          startDate: "Jan 2023",
          endDate: "Present",
          current: true,
          description: "- Engineered the core dashboard interface using React and TypeScript, boosting throughput and reducing initial paint times by 42%.\n- Led migration of state management from a legacy framework to modern Redux Toolkit, decreasing codebase complexity by 25%.\n- Mentored 4 junior frontend developers on custom React hooks and component testing patterns."
        },
        {
          company: "Innovate Interactive",
          position: "Frontend Developer",
          location: "Remote",
          startDate: "Mar 2021",
          endDate: "Dec 2022",
          current: false,
          description: "- Developed scalable Single Page Applications using HTML5, CSS3, and JavaScript (ES6+).\n- Integrated third-party RESTful APIs and GraphQL endpoints, improving data synchronization accuracy.\n- Designed component library using TailwindCSS, reducing CSS bundle size by 35% across 3 distinct sub-projects."
        }
      ],
      education: [
        {
          school: "University of California, Berkeley",
          degree: "B.S. Computer Science",
          location: "Berkeley, CA",
          startDate: "2016",
          endDate: "2020"
        }
      ],
      skills: [
        {
          name: "Frontend Languages & Frameworks",
          level: "Expert",
          keywords: ["JavaScript", "React", "HTML5", "CSS3", "TypeScript", "Next.js"]
        },
        {
          name: "State & Data Fetching",
          level: "Advanced",
          keywords: ["Redux", "Zustand", "GraphQL", "REST APIs"]
        },
        {
          name: "Tools & Testing",
          level: "Proficient",
          keywords: ["Git", "Webpack", "Vite", "Jest", "TailwindCSS"]
        }
      ],
      projects: [
        {
          title: "PixelForge Component Library",
          role: "Lead Creator",
          startDate: "2024",
          url: "github.com/alexriveradev/pixelforge",
          description: "An open-source custom component library with full accessibility compliance and custom theme adapters. Reached 1,200+ stars on GitHub."
        }
      ],
      certifications: [
        {
          name: "AWS Certified Developer – Associate",
          issuer: "Amazon Web Services",
          date: "Aug 2024",
          url: "aws.cert.com/verify-alex"
        }
      ],
      languages: [
        {
          language: "English",
          proficiency: "Native / Professional"
        },
        {
          language: "Spanish",
          proficiency: "Conversational"
        }
      ],
      sectionOrder: ["summary", "experience", "education", "skills", "projects", "certifications", "languages"],
      atsMetadata: {
        score: 45,
        feedback: [
          "Missing critical MERN stack keywords: MongoDB, Node.js, Express.js.",
          "DevOps indicators like Docker or CI/CD pipelines are not present.",
          "Experience descriptions lack full-stack database integrations."
        ]
      }
    });

    setAtsBreakdown({
      missingKeywords: ["MongoDB", "Express.js", "Node.js", "Docker", "CI/CD", "Redis", "JWT"],
      matchedKeywords: ["React", "Redux", "Zustand", "JavaScript", "HTML5", "CSS3", "AWS", "Git"],
      recommendations: [
        "Detail your full-stack backend experience with Node.js and Express.js controllers.",
        "Add database indexing and aggregation methods using MongoDB to your skills list.",
        "Inject DevOps concepts like containerizing apps with Docker and automating deployment with CI/CD."
      ],
      metrics: {
        keywordMatch: 45,
        skillsCoverage: 52,
        experienceRelevance: 48,
        formattingScore: 90
      }
    });

    setSaveStatus('Demo resume loaded successfully!');
    setJdText('');
    setSelectedJdPreset('');
    setLocalSkillsText({});
  };

  // Instant full stack optimization for MERN Stack developer demo
  const handleQuickOptimize = async () => {
    if ((selectedJdPreset !== 'mern') && (analyzedJdPreset !== 'mern')) {
      setAtsError({ type: 'validation', message: 'Please select the MERN Stack Developer job description preset first to use Auto-Fix.' });
      return;
    }
    setIsAutoFixing(true);
    await new Promise(resolve => setTimeout(resolve, 250));

    const optimizedExperience = [
      {
        company: "TechNova Solutions",
        position: "Senior Frontend Engineer",
        location: "San Francisco, CA",
        startDate: "Jan 2023",
        endDate: "Present",
        current: true,
        description: "- Engineered the core full-stack web dashboard using React, Node.js, Express.js, and MongoDB, boosting system data throughput by 42%.\n- Led migration of state management from a legacy framework to modern Redux Toolkit, decreasing codebase complexity by 25%.\n- Mentored 4 junior frontend developers on custom React hooks and component testing patterns."
      },
      {
        company: "Innovate Interactive",
        position: "Frontend Developer",
        location: "Remote",
        startDate: "Mar 2021",
        endDate: "Dec 2022",
        current: false,
        description: "- Developed scalable Single Page Applications using HTML5, CSS3, and JavaScript (ES6+).\n- Integrated third-party RESTful APIs, GraphQL endpoints, and Redis caching layers, improving data synchronization accuracy.\n- Designed component library using TailwindCSS, reducing CSS bundle size by 35% across 3 distinct sub-projects."
      }
    ];

    const optimizedSkills = [
      {
        name: "Full-Stack Technologies",
        level: "Expert",
        keywords: ["MongoDB", "Express.js", "React", "Node.js", "JavaScript", "TypeScript", "Next.js"]
      },
      {
        name: "DevOps & Cloud Networks",
        level: "Advanced",
        keywords: ["AWS", "Docker", "CI/CD", "Redis", "JWT", "Kubernetes", "Git"]
      },
      {
        name: "Testing & Architecture",
        level: "Proficient",
        keywords: ["Jest", "Webpack", "Vite", "TailwindCSS"]
      }
    ];

    updateResumeLocal({
      experience: optimizedExperience,
      skills: optimizedSkills,
      atsMetadata: {
        score: 94,
        feedback: ["Outstanding ATS optimization! Your resume includes all primary tech-stack requirements, cloud indicators, and quantifiable business values."]
      }
    });

    setAtsBreakdown({
      missingKeywords: [],
      matchedKeywords: ["React", "Redux", "Zustand", "JavaScript", "HTML5", "CSS3", "AWS", "Git", "MongoDB", "Express.js", "Node.js", "Docker", "CI/CD", "Redis", "JWT"],
      recommendations: ["Excellent match! Your resume contains all keywords and meets high formatting standards."],
      metrics: {
        keywordMatch: 95,
        skillsCoverage: 96,
        experienceRelevance: 92,
        formattingScore: 95
      }
    });

    setLocalSkillsText({});
    setIsAutoFixing(false);
    setShowConfetti(true);
    setSaveStatus('ATS optimization complete!');
  };

  const handleJdAnalysis = async () => {
    if (!jdText.trim()) return;
    setIsJdAnalyzing(true);
    setAtsPhase('Analyzing Job Description...');
    setAtsError(null); // Clear any previous error before new attempt

    try {
      if (hasUnsavedChanges) {
        setSaveStatus('Saving changes before analysis...');
        const saveSuccess = await saveResumeImmediately();
        if (!saveSuccess) {
          setAtsError({
            type: 'server',
            message: 'Failed to auto-save resume changes before running analysis. Please check your network connection and try again.'
          });
          setSaveStatus('Save failed.');
          return;
        }
      }

      let response;
      try {
        response = await fetch(`${API_URL}/ai/analyze-jd`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('cf_token')}`
          },
          body: JSON.stringify({
            resumeId: id,
            jdText
          })
        });
      } catch (networkError) {
        // Network-level failure (server unreachable, DNS failure, CORS, etc.)
        const msg = 'Network error — could not reach the server. Check your connection and try again.';
        setAtsError({ type: 'network', message: msg });
        setSaveStatus('ATS analysis failed — network error.');
        return;
      }

      // Parse the response body safely
      let data;
      try {
        data = await response.json();
      } catch {
        const msg = `Server returned an unreadable response (HTTP ${response.status}). Please try again.`;
        setAtsError({ type: 'parse', message: msg });
        setSaveStatus('ATS analysis failed — server error.');
        return;
      }

      if (!response.ok || !data.success) {
        // Classify server-side errors by HTTP status code
        let userMsg;
        if (response.status === 500) {
          userMsg = data.message
            ? `Server error: ${data.message}`
            : 'The ATS analysis failed on the server (HTTP 500). This is a server-side issue — please try again in a moment.';
          setAtsError({ type: 'server', message: userMsg, retry: true });
          setSaveStatus('ATS analysis failed — server error (500).');
        } else if (response.status === 400) {
          userMsg = data.message || 'Invalid request. Please ensure the job description text is not empty.';
          setAtsError({ type: 'validation', message: userMsg });
          setSaveStatus('ATS analysis failed — invalid request.');
        } else if (response.status === 401 || response.status === 403) {
          userMsg = 'Your session has expired. Please log in again to run ATS analysis.';
          setAtsError({ type: 'auth', message: userMsg });
          setSaveStatus('ATS analysis failed — authentication required.');
        } else if (response.status === 404) {
          userMsg = 'Resume not found. Please refresh the page and try again.';
          setAtsError({ type: 'notfound', message: userMsg });
          setSaveStatus('ATS analysis failed — resume not found.');
        } else {
          userMsg = data.message || `ATS analysis failed (HTTP ${response.status}). Please try again.`;
          setAtsError({ type: 'api', message: userMsg, retry: true });
          setSaveStatus(`ATS analysis failed (${response.status}).`);
        }
        return;
      }

      // Success path — clear any residual error state
      setAtsError(null);
      setAtsPhase('Calculating ATS Score...');
      setAtsBreakdown(data.breakdown);
      setAtsPhase('Saving Results...');
      setAnalyzedJdPreset(selectedJdPreset);
      setAnalyzedJdText(jdText);
      await loadResumeById(id);
      setShowConfetti(true);
      setSaveStatus('ATS analysis complete!');
    } finally {
      setAtsPhase('');
      setIsJdAnalyzing(false);
    }
  };


  const openMagicOptimizer = (type, currentVal, applyFn) => {
    setOptimizerType(type);
    setOriginalText(currentVal);
    setOptimizedText('');
    setTargetKeyword('');
    setMagicPromptType(type === 'summary' ? 'summary_rewrite' : 'bullet_rewrite');
    setOnApplyCallback(() => applyFn);
    setIsOptimizerOpen(true);
  };

  const getBackendPromptType = (promptType) => {
    const promptTypeMap = {
      quantify: 'achievement_quantification',
      ats_inject: 'ats_optimization'
    };
    return promptTypeMap[promptType] || promptType;
  };

  const getOptimizerContextKeyword = () => {
    const manualKeyword = targetKeyword.trim();
    if (manualKeyword) return manualKeyword;

    if (magicPromptType === 'summary_rewrite') {
      return getTargetKeywords().slice(0, 8).join(', ');
    }

    if (magicPromptType === 'bullet_rewrite') {
      return dynamicAtsData.missingKeywords[0] || '';
    }

    return '';
  };

  const startStreamOptimization = async () => {
    setIsOptimizing(true);
    setOptimizedText('');
    setCurrentLogId(null);

    const controller = new AbortController();
    setActiveAbortController(controller);

    try {
      const params = new URLSearchParams({
        resumeId: id,
        promptType: getBackendPromptType(magicPromptType),
        originalText,
        contextKeyword: getOptimizerContextKeyword()
      });

      const response = await fetch(`${API_URL}/ai/stream-rewrite?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cf_token')}`
        },
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Stream error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.error) {
                throw new Error(data.message);
              }
              if (data.complete) {
                setCurrentLogId(data.logId);
                setIsOptimizing(false);
                fetchPlanStats();
                fetchHistoryLogs();
              } else if (data.text) {
                setOptimizedText(prev => prev + data.text);
              }
            } catch (e) {
              // Ignore partial parsing
            }
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('AI Optimization streaming error:', e);
        setOptimizedText(`Optimization failed: ${e.message}`);
      }
      setIsOptimizing(false);
    }
  };

  const cancelOptimization = () => {
    if (activeAbortController) {
      activeAbortController.abort();
      setActiveAbortController(null);
      setIsOptimizing(false);
    }
  };

  const applySuggestion = async () => {
    if (onApplyCallback && optimizedText) {
      onApplyCallback(optimizedText);
      
      // Auto-save changes locally
      updateResumeLocal({});
      
      if (currentLogId) {
        try {
          await fetch(`${API_URL}/ai/accept`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('cf_token')}`
            },
            body: JSON.stringify({ logId: currentLogId })
          });
          fetchHistoryLogs();
        } catch (e) {
          console.error(e);
        }
      }

      if (currentResume?.atsMetadata?.lastJdHash && analyzedJdText) {
        await saveResumeImmediately();
        await handleJdAnalysis();
      }

      setIsOptimizerOpen(false);
    }
  };

  const rollbackSuggestion = async (logId) => {
    try {
      const response = await fetch(`${API_URL}/ai/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cf_token')}`
        },
        body: JSON.stringify({ logId })
      });
      const data = await response.json();
      if (data.success) {
        const log = data.log;
        if (log.actionType === 'summary_rewrite') {
          handleSummaryChange(data.originalContent);
        } else {
          alert(`Original content restored! Copied to clipboard:\n\n${data.originalContent}`);
          navigator.clipboard.writeText(data.originalContent);
        }
        fetchHistoryLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load the specific resume on mount
  useEffect(() => {
    loadResumeById(id);
    setLocalSkillsText({});
  }, [id, loadResumeById]);

  // Reset manual save state when autoSave is enabled again
  useEffect(() => {
    if (autoSaveEnabled) {
      setManualSavePerformed(false);
    }
  }, [autoSaveEnabled]);

  // Sync visual saving feedback with Auto Save Toggle requirements
  useEffect(() => {
    if (autoSaveEnabled) {
      if (saving) {
        setSaveStatus('Saving changes...');
      } else {
        setSaveStatus('All changes saved');
      }
    } else {
      if (saving) {
        setSaveStatus('Saving changes...');
      } else if (hasUnsavedChanges) {
        setSaveStatus('Unsaved Changes');
      } else if (manualSavePerformed) {
        setSaveStatus('All Changes Saved');
      } else {
        setSaveStatus('Manual Save Mode');
      }
    }
  }, [saving, autoSaveEnabled, hasUnsavedChanges, manualSavePerformed]);

  // Unsaved changes beforeunload protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!autoSaveEnabled && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSaveEnabled, hasUnsavedChanges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-lg">Forging your editing studio...</p>
      </div>
    );
  }

  if (error && !currentResume) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Failed to Load Resume</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2">{error}</p>
        <Link to="/dashboard" className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!currentResume) return null;

  // Local state update helpers
  const handlePersonalInfoChange = (field, value) => {
    updateResumeLocal({
      personalInfo: {
        ...personalInfo,
        [field]: value
      }
    });
  };

  const handleSummaryChange = (value) => {
    updateResumeLocal({ summary: value });
  };

  // Experience CRUD
  const handleAddExperience = () => {
    const newItem = { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    updateResumeLocal({ experience: [...experience, newItem] });
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ experience: updated });
  };

  const handleRemoveExperience = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    updateResumeLocal({ experience: updated });
  };

  // Education CRUD
  const handleAddEducation = () => {
    const newItem = { school: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    updateResumeLocal({ education: [...education, newItem] });
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ education: updated });
  };

  const handleRemoveEducation = (index) => {
    const updated = education.filter((_, i) => i !== index);
    updateResumeLocal({ education: updated });
  };

  // Skills CRUD (categorized skills with comma-separated inputs)
  const handleAddSkillCategory = () => {
    const newItem = { name: '', level: '', keywords: [] };
    updateResumeLocal({ skills: [...skills, newItem] });
    setLocalSkillsText(prev => ({ ...prev, [skills.length]: '' }));
  };

  const handleUpdateSkillCategory = (index, field, value) => {
    const updated = [...skills];
    if (field === 'keywords') {
      setLocalSkillsText(prev => ({ ...prev, [index]: value }));
      const arr = value.split(',').map(s => s.trim()).filter(s => s !== '');
      updated[index] = { ...updated[index], keywords: arr };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    updateResumeLocal({ skills: updated });
  };

  const handleRemoveSkillCategory = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    updateResumeLocal({ skills: updated });
    setLocalSkillsText(prev => {
      const next = {};
      updated.forEach((_, i) => {
        const oldKey = i >= index ? i + 1 : i;
        if (prev[oldKey] !== undefined) {
          next[i] = prev[oldKey];
        }
      });
      return next;
    });
  };

  // Projects CRUD
  const handleAddProject = () => {
    const newItem = { title: '', role: '', startDate: '', endDate: '', url: '', description: '' };
    updateResumeLocal({ projects: [...projects, newItem] });
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ projects: updated });
  };

  const handleRemoveProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    updateResumeLocal({ projects: updated });
  };

  // Certifications CRUD
  const handleAddCertification = () => {
    const newItem = { name: '', issuer: '', date: '', url: '' };
    updateResumeLocal({ certifications: [...certifications, newItem] });
  };

  const handleUpdateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ certifications: updated });
  };

  const handleRemoveCertification = (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    updateResumeLocal({ certifications: updated });
  };

  // Languages CRUD
  const handleAddLanguage = () => {
    const newItem = { language: '', proficiency: '' };
    updateResumeLocal({ languages: [...languages, newItem] });
  };

  const handleUpdateLanguage = (index, field, value) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ languages: updated });
  };

  const handleRemoveLanguage = (index) => {
    const updated = languages.filter((_, i) => i !== index);
    updateResumeLocal({ languages: updated });
  };

  // Section Ordering actions
  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Swap items
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    updateResumeLocal({ sectionOrder: newOrder });
  };

  // Toggle accordions helper
  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? '' : name);
  };

  // Immediate save trigger
  const handleForceSave = async () => {
    setSaveStatus('Saving immediately...');
    const ok = await saveResumeImmediately();
    if (ok) {
      setManualSavePerformed(true);
      setSaveStatus('All Changes Saved');
    } else {
      setSaveStatus('Save error. Try again.');
    }
  };


  const resetUploadModal = () => {
    setSelectedResumeFile(null);
    setUploadError('');
    setUploadSuccess('');
    setIsImportingResume(false);
  };

  const closeUploadModal = () => {
    if (isImportingResume) return;
    resetUploadModal();
    setIsUploadModalOpen(false);
  };

  const handleResumeFileChange = (event) => {
    const file = event.target.files?.[0];
    setUploadError('');
    setUploadSuccess('');

    if (!file) {
      setSelectedResumeFile(null);
      return;
    }

    const extension = file.name.toLowerCase().split('.').pop();
    if (!['pdf', 'docx'].includes(extension)) {
      setSelectedResumeFile(null);
      setUploadError('Unsupported file type. Please upload a PDF or DOCX resume.');
      return;
    }

    if (file.size === 0) {
      setSelectedResumeFile(null);
      setUploadError('That file appears to be empty. Please choose another resume.');
      return;
    }

    setSelectedResumeFile(file);
  };

  const handleResumeImport = async () => {
    if (!selectedResumeFile) {
      setUploadError('Please choose a PDF or DOCX resume to upload.');
      return;
    }

    setIsImportingResume(true);
    setUploadError('');
    setUploadSuccess('');
    setSaveStatus('Importing resume...');

    const formData = new FormData();
    formData.append('resume', selectedResumeFile);

    try {
      const response = await fetch(`${API_URL}/upload/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cf_token')}`
        },
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Server returned an unreadable response (HTTP ${response.status}). Please try again.`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Resume import failed. Please try again.');
      }

      const importedResume = data.data || {};
      updateResumeLocal({
        personalInfo: importedResume.personalInfo || {},
        summary: importedResume.summary || '',
        experience: importedResume.experience || [],
        education: importedResume.education || [],
        skills: importedResume.skills || [],
        certifications: importedResume.certifications || [],
        projects: importedResume.projects || [],
        languages: importedResume.languages || [],
      });
      setLocalSkillsText({});

      const saveOk = await saveResumeImmediately();
      if (!saveOk) {
        throw new Error('Resume imported, but the save did not complete. Please try Save Now or check your connection.');
      }

      setUploadSuccess('Resume imported successfully. Your builder and preview are now updated.');
      setSaveStatus('Imported resume saved');
      setTimeout(() => {
        resetUploadModal();
        setIsUploadModalOpen(false);
      }, 900);
    } catch (err) {
      const friendlyMessage = err instanceof TypeError
        ? 'Network error — could not reach the server. Check your connection and try again.'
        : err.message || 'Resume import failed. Please try again.';
      setUploadError(friendlyMessage);
      setSaveStatus('Resume import failed');
    } finally {
      setIsImportingResume(false);
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={pageTransitions}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col"
    >
      {/* Top action header banner */}
      <header id="builder-header-banner" className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            onClick={async (e) => {
              if (!autoSaveEnabled && hasUnsavedChanges) {
                const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave without saving?");
                if (!confirmLeave) {
                  e.preventDefault();
                  return;
                }
              }
              await saveResumeImmediately();
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => updateResumeLocal({ title: e.target.value })}
                className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 font-bold font-display text-slate-800 dark:text-slate-100 text-lg focus:outline-none px-1 py-0.5 rounded transition-all"
              />
              {isOptimizeMode ? (
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
                  ATS Optimization Mode
                </span>
              ) : (
                <span className="bg-slate-100 dark:bg-slate-850 text-slate-555 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
                  Resume Builder Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span>Status:</span>
              <span className={`font-semibold ${saving ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-500'}`}>
                {saveStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Mode */}
          <button
            onClick={loadDemoData}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 cursor-pointer active:scale-95 hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Load Demo Resume</span>
          </button>

          <button
            onClick={() => {
              resetUploadModal();
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer active:scale-95 hover:-translate-y-0.5"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>Upload Existing Resume</span>
          </button>

          {/* Auto Save Toggle Switch */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 select-none">
            <span className="text-slate-500 dark:text-slate-400">Auto Save:</span>
            <span className={autoSaveEnabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
              {autoSaveEnabled ? 'ON' : 'OFF'}
            </span>
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoSaveEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  autoSaveEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Professional Custom Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              <span>Theme: <strong className="text-indigo-600 dark:text-indigo-400 capitalize">{activeTheme === 'minimalist' ? 'Minimal' : activeTheme}</strong></span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${themeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options list */}
            {themeDropdownOpen && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setThemeDropdownOpen(false)} 
                />
                
                <div className="absolute inset-x-0 mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {[
                    { id: 'modern',     label: 'Modern' },
                    { id: 'minimalist', label: 'Minimalist' },
                    { id: 'classic',    label: 'Classic' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={async () => {
                        setActiveTheme(t.id);
                        updateResumeLocal({ templateId: t.id });
                        setThemeDropdownOpen(false);
                        await saveResumeImmediately();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors duration-150 cursor-pointer text-xs
                        ${activeTheme === t.id
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 font-medium'
                        }
                      `}
                    >
                      <span>{t.label}</span>
                      {activeTheme === t.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {!autoSaveEnabled && (
            <button
              onClick={handleForceSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Now</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Editor Split-Screen Layout Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT WORKSPACE: Input Accordion Editor Panel */}
        <motion.div 
          id="builder-left-workspace"
          variants={slideUp}
          className="w-full md:w-[48%] lg:w-[45%] border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto p-5 space-y-6 bg-slate-50 dark:bg-slate-950/20 text-left"
        >
          
          {/* Dedicated JD Analysis & Circular ATS Score Panel */}
          {isOptimizeMode && (
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/35 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    ATS Analyzer Intelligence
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Plan Tier: <span className="text-indigo-500 font-extrabold">{planStats.plan}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsJdOpen(!isJdOpen)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isJdOpen ? 'Hide Input' : 'Target JD'}
              </button>
            </div>

            {/* Pasting JD Accordion Section with Sample Job Description dropdown library */}
            {isJdOpen && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Job Description</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-400 font-bold">Preset:</span>
                      <select
                        value={selectedJdPreset}
                        onChange={(e) => handlePresetChange(e.target.value)}
                        className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold rounded-lg text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Choose Job --</option>
                        <option value="mern">MERN Stack Developer</option>
                        <option value="frontend">Frontend Developer</option>
                        <option value="software_engineer">Software Engineer</option>
                        <option value="product_manager">Product Manager</option>
                        <option value="data_analyst">Data Analyst</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Paste the target job description text here to calculate your precise match score..."
                    value={jdText}
                    onChange={(e) => {
                      setJdText(e.target.value);
                      setSelectedJdPreset('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
                <button
                  type="button"
                  disabled={isJdAnalyzing || !jdText.trim()}
                  onClick={handleJdAnalysis}
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isJdAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>{atsPhase || 'Running ATS Matcher...'}</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-3.5 h-3.5" />
                      <span>Run ATS Matcher</span>
                    </>
                  )}
                </button>

                {/* Inline ATS Error Banner — shown when analysis fails, no browser alerts */}
                {atsError && (
                  <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${
                    atsError.type === 'server' || atsError.type === 'network' || atsError.type === 'parse'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400'
                      : atsError.type === 'validation'
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400'
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{atsError.message}</p>
                      {atsError.retry && (
                        <button
                          type="button"
                          onClick={() => { setAtsError(null); handleJdAnalysis(); }}
                          className="mt-1.5 text-[10px] font-bold underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          Retry Analysis →
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAtsError(null)}
                      className="text-inherit opacity-50 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                      aria-label="Dismiss error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Score & Breakdown display */}
            {!currentResume?.atsMetadata?.lastJdHash ? (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center py-6 px-4 bg-slate-50/55 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800 space-y-2">
                <Brain className="w-8 h-8 text-slate-400/80 mx-auto animate-pulse" />
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No Job Description Analyzed
                </h5>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Enter a target Job Description above and click "Run ATS Matcher" to perform semantic AI matching.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Circular ATS score progress with click overlay & confetti sparkles */}
                  <div 
                    onClick={() => setShowAtsReportModal(true)}
                    className="relative w-16 h-16 shrink-0 flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-200"
                    title="Click to view detailed analytics report breakdown"
                  >
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                    
                    {/* Floating particle burst confetti */}
                    {showConfetti && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                        {[...Array(15)].map((_, i) => {
                          const angle = (i / 15) * 2 * Math.PI;
                          const velocity = 35 + Math.random() * 40;
                          const x = Math.cos(angle) * velocity;
                          const y = Math.sin(angle) * velocity;
                          const color = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5];
                          return (
                            <motion.div
                              key={i}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                              animate={{
                                x,
                                y,
                                opacity: 0,
                                scale: [0.5, 1.2, 0],
                                rotate: Math.random() * 360
                              }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="absolute w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          );
                        })}
                      </div>
                    )}

                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth="5.5"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className={`${
                          animatedScore >= 80
                            ? 'stroke-emerald-500 shadow-emerald-500/30'
                            : animatedScore >= 60
                            ? 'stroke-amber-500 shadow-amber-500/30'
                            : 'stroke-red-500 shadow-red-500/30'
                        } transition-all duration-500`}
                        strokeWidth="5.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - animatedScore / 100)}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform duration-200">
                        {animatedScore}%
                      </span>
                      <span className="text-[6px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                        Click
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {animatedScore >= 80 ? 'Excellent Match!' : animatedScore >= 60 ? 'Good Potential' : 'Needs Optimization'}
                      </h5>
                      {analyzedJdPreset === 'mern' && dynamicAtsData.missingKeywords.length > 0 && (
                        <button
                          onClick={handleQuickOptimize}
                          disabled={isAutoFixing}
                          className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-[9px] font-extrabold text-white rounded-lg flex items-center gap-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isAutoFixing ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-2.5 h-2.5" />
                          )}
                          <span>{isAutoFixing ? 'Fixing...' : 'Auto-Fix'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed truncate">
                      {atsMetadata.feedback && atsMetadata.feedback.length > 0
                        ? atsMetadata.feedback[0]
                        : 'Choose a JD above to calculate your keyword alignments.'}
                    </p>
                    <div className="text-[9px] text-slate-400 font-medium">
                      AI rewrite credit usage: <span className="font-bold text-slate-600 dark:text-slate-300">{planStats.aiRewriteCount} / {planStats.aiLimit === Infinity ? 'Unlimited' : planStats.aiLimit}</span>
                    </div>
                  </div>
                </div>

                {/* ATS Score History — Before / After / Improvement */}
                <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 space-y-2.5">
                  {/* Status Badge row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analysis Status</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none ${
                      hasOptimization
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800/85 text-slate-500 dark:text-slate-400'
                    }`}>
                      {hasOptimization ? '✦ Optimized' : 'Initial Analysis'}
                    </span>
                  </div>

                  {/* Before / After / Improvement row */}
                  {hasOptimization ? (
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="text-center flex-1">
                        <div className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Before</div>
                        <div className="text-sm font-extrabold text-slate-600 dark:text-slate-300 mt-0.5">{initialAtsScore}%</div>
                      </div>
                      <div className="text-slate-300 dark:text-slate-700 text-xs">→</div>
                      <div className="text-center flex-1">
                        <div className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">After</div>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{optimizedAtsScore}%</div>
                      </div>
                      <div className="text-slate-300 dark:text-slate-700 text-xs shrink-0">|</div>
                      <div className="text-center flex-1">
                        <div className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Change</div>
                        <div className={`text-sm font-extrabold mt-0.5 ${
                          scoreImprovement > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : scoreImprovement < 0
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {scoreImprovement > 0 ? `+${scoreImprovement}%` : `${scoreImprovement}%`}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Current ATS Match</span>
                      <span className={`text-sm font-extrabold ${
                        activeAtsScore >= 80 ? 'text-emerald-500' : activeAtsScore >= 60 ? 'text-amber-500' : 'text-red-500'
                      }`}>{activeAtsScore}%</span>
                    </div>
                  )}
                </div>

                {/* Resume Strength Dashboard with Readiness Indicator */}
                <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>ATS Readiness Index</span>
                    <span className={`${
                      animatedScore >= 80 ? 'text-emerald-500' : animatedScore >= 60 ? 'text-amber-500' : 'text-red-500'
                    } font-extrabold`}>
                      {animatedScore >= 80 ? 'Ready to Apply' : animatedScore >= 60 ? 'Good Match (Polish)' : 'Critical Gaps'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 rounded-full ${
                        animatedScore >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : animatedScore >= 60 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${animatedScore}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-[9px] pt-1">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 rounded-lg">
                      <div className="font-bold text-slate-400 uppercase tracking-widest text-[7.5px]">Matched</div>
                      <div className="text-xs font-extrabold text-emerald-500 mt-0.5">
                        {dynamicAtsData.matchedKeywords.length} keywords
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 rounded-lg">
                      <div className="font-bold text-slate-400 uppercase tracking-widest text-[7.5px]">Gaps</div>
                      <div className="text-xs font-extrabold text-red-400 mt-0.5">
                        {dynamicAtsData.missingKeywords.length} keywords
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyword gaps list (Searchable, fully responsive) */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ATS Keyword Visualizer</h6>
                    <input
                      type="text"
                      placeholder="Filter keywords..."
                      value={keywordSearch}
                      onChange={(e) => setKeywordSearch(e.target.value)}
                      className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] focus:outline-none focus:border-indigo-500 w-24"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {(() => {
                      const allKw = [
                        ...dynamicAtsData.matchedKeywords.map(k => ({ name: k, matched: true })),
                        ...dynamicAtsData.missingKeywords.map(k => ({ name: k, matched: false }))
                      ];
                      const filtered = allKw.filter(k => k.name.toLowerCase().includes(keywordSearch.toLowerCase()));
                      
                      if (filtered.length === 0) {
                        return <span className="text-[9px] text-slate-400">No matching keywords found.</span>;
                      }

                      return filtered.map((kw) => (
                        <span
                          key={kw.name}
                          onClick={() => {
                            if (!kw.matched) {
                              openMagicOptimizer('bullet', '', (newVal) => {
                                alert(`Suggested optimized sentence to inject:\n\n${newVal}`);
                              });
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border flex items-center gap-1 transition-colors ${
                            kw.matched 
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                              : 'bg-amber-50/60 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 cursor-pointer hover:border-indigo-500'
                          }`}
                          title={kw.matched ? "Successfully matched!" : "Click to optimize and inject using AI"}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${kw.matched ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          {kw.name}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </>
            )}

            {/* ATS Score History */}
            {hasOptimization && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                <h6 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-indigo-500" />
                  ATS Optimization History
                </h6>
                <div className="bg-gradient-to-br from-indigo-50/40 to-emerald-50/20 dark:from-slate-950/45 dark:to-slate-900/25 border border-slate-200/50 dark:border-slate-800/80 p-3.5 rounded-2xl space-y-3">
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    {/* Before Optimization */}
                    <div className="bg-white/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 p-2 rounded-xl">
                      <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Before</div>
                      <div className="text-sm font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">
                        {initialAtsScore}%
                      </div>
                    </div>
                    {/* After Optimization */}
                    <div className="bg-white dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900/60 p-2 rounded-xl shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500/10 rounded-full blur-sm" />
                      <div className="text-[8px] font-bold text-indigo-500 uppercase tracking-wider">After AI</div>
                      <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {optimizedAtsScore}%
                      </div>
                    </div>
                    {/* Improvement */}
                    <div className="bg-white/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 p-2 rounded-xl flex flex-col justify-center items-center">
                      <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gain</div>
                      <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-bold mt-1">
                        <ArrowUp className="w-2.5 h-2.5 stroke-[3px]" />
                        <span>+{scoreImprovement}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                    This resume has been optimized with AI. Recalculate anytime to verify matches.
                  </p>
                </div>
              </div>
            )}
          </div>
          )}

          <div className="space-y-4">
            {/* 1. PERSONAL INFORMATION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('personal')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span>Personal Details</span>
                </div>
                {activeAccordion === 'personal' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'personal' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={personalInfo.fullName || ''}
                            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            value={personalInfo.email || ''}
                            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                          <input
                            type="text"
                            placeholder="+1 (555) 000-0000"
                            value={personalInfo.phone || ''}
                            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                          <input
                            type="text"
                            placeholder="San Francisco, CA"
                            value={personalInfo.location || ''}
                            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Links & Portfolios</h5>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">Website</label>
                            <input
                              type="text"
                              placeholder="portfolio.com"
                              value={personalInfo.website || ''}
                              onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">GitHub</label>
                            <input
                              type="text"
                              placeholder="github.com/user"
                              value={personalInfo.github || ''}
                              onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">LinkedIn</label>
                            <input
                              type="text"
                              placeholder="linkedin.com/in/user"
                              value={personalInfo.linkedin || ''}
                              onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. PROFESSIONAL SUMMARY */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('summary')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Professional Summary</span>
                </div>
                {activeAccordion === 'summary' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'summary' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Bio</label>
                      <textarea
                        rows={4}
                        placeholder="Write a compelling, core target profile summarizing your experience and top skills..."
                        value={summary}
                        onChange={(e) => handleSummaryChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
                      />
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => openMagicOptimizer('summary', summary, (newVal) => handleSummaryChange(newVal))}
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-500/25 cursor-pointer hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-150"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Magic AI Rewrite</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. WORK EXPERIENCE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('experience')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <span>Experience ({experience.length})</span>
                </div>
                {activeAccordion === 'experience' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'experience' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {experience.map((exp, idx) => (
                        <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveExperience(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Position #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Company</label>
                              <input
                                type="text"
                                placeholder="Google"
                                value={exp.company}
                                onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Role Title</label>
                              <input
                                type="text"
                                placeholder="Senior Engineer"
                                value={exp.position}
                                onChange={(e) => handleUpdateExperience(idx, 'position', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Location</label>
                              <input
                                type="text"
                                placeholder="Remote"
                                value={exp.location}
                                onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Start Date</label>
                              <input
                                type="text"
                                placeholder="Jan 2024"
                                value={exp.startDate}
                                onChange={(e) => handleUpdateExperience(idx, 'startDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">End Date</label>
                              <input
                                type="text"
                                placeholder="Present"
                                disabled={exp.current}
                                value={exp.current ? 'Present' : exp.endDate}
                                onChange={(e) => handleUpdateExperience(idx, 'endDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none disabled:opacity-55"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`current-${idx}`}
                              checked={exp.current}
                              onChange={(e) => handleUpdateExperience(idx, 'current', e.target.checked)}
                              className="w-3.5 h-3.5 text-indigo-600 bg-white dark:bg-slate-900 border-slate-200 rounded"
                            />
                            <label htmlFor={`current-${idx}`} className="text-[10px] font-bold text-slate-500">I currently work here</label>
                          </div>

                           <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">Impact & Responsibilities (Bulleted)</label>
                            <textarea
                              rows={3}
                              placeholder="- Implemented scalable Node APIs boosting throughput by 30%&#10;- Led team of 4 engineers..."
                              value={exp.description}
                              onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
                            />
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => openMagicOptimizer('bullet', exp.description, (newVal) => handleUpdateExperience(idx, 'description', newVal))}
                                className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md shadow-sm shadow-indigo-500/25 cursor-pointer hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-150"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Optimize Bullets</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Experience
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. EDUCATION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('education')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>Education ({education.length})</span>
                </div>
                {activeAccordion === 'education' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'education' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {education.map((edu, idx) => (
                        <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveEducation(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">School #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">School/University</label>
                              <input
                                type="text"
                                placeholder="Stanford"
                                value={edu.school}
                                onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Degree & Major</label>
                              <input
                                type="text"
                                placeholder="B.S. Computer Science"
                                value={edu.degree}
                                onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Location</label>
                              <input
                                type="text"
                                placeholder="Stanford, CA"
                                value={edu.location}
                                onChange={(e) => handleUpdateEducation(idx, 'location', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Start Year</label>
                              <input
                                type="text"
                                placeholder="2020"
                                value={edu.startDate}
                                onChange={(e) => handleUpdateEducation(idx, 'startDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">End Year</label>
                              <input
                                type="text"
                                placeholder="2024"
                                value={edu.endDate}
                                onChange={(e) => handleUpdateEducation(idx, 'endDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Education
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5. TECHNICAL SKILLS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('skills')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-indigo-500" />
                  <span>Skills ({skills.length})</span>
                </div>
                {activeAccordion === 'skills' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'skills' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveSkillCategory(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Skill Group #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Group Name</label>
                              <input
                                type="text"
                                placeholder="Languages"
                                value={skill.name}
                                onChange={(e) => handleUpdateSkillCategory(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Proficiency Level (Optional)</label>
                              <input
                                type="text"
                                placeholder="Expert"
                                value={skill.level}
                                onChange={(e) => handleUpdateSkillCategory(idx, 'level', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">Keywords (Comma Separated)</label>
                            <input
                              type="text"
                              placeholder="React, JavaScript, HTML, CSS"
                              value={localSkillsText[idx] !== undefined ? localSkillsText[idx] : (skill.keywords ? skill.keywords.join(', ') : '')}
                              onChange={(e) => handleUpdateSkillCategory(idx, 'keywords', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            />
                            <p className="text-[9px] text-slate-400">Separate keywords with commas. Essential for ATS matching filters.</p>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddSkillCategory}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Skill Group
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. PROJECTS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('projects')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-4 h-4 text-indigo-500" />
                  <span>Projects ({projects.length})</span>
                </div>
                {activeAccordion === 'projects' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'projects' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {projects.map((proj, idx) => (
                        <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveProject(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Project #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Project Name</label>
                              <input
                                type="text"
                                placeholder="E-Commerce API"
                                value={proj.title}
                                onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Role/Scope</label>
                              <input
                                type="text"
                                placeholder="Solo Creator"
                                value={proj.role}
                                onChange={(e) => handleUpdateProject(idx, 'role', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1 col-span-2">
                              <label className="text-[9px] font-bold text-slate-400">Project URL</label>
                              <input
                                type="text"
                                placeholder="github.com/my-project"
                                value={proj.url}
                                onChange={(e) => handleUpdateProject(idx, 'url', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Date</label>
                              <input
                                type="text"
                                placeholder="2025"
                                value={proj.startDate}
                                onChange={(e) => handleUpdateProject(idx, 'startDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">Project Description</label>
                            <textarea
                              rows={2.5}
                              placeholder="Built scalable auth pipelines utilizing Redis cache layer..."
                              value={proj.description}
                              onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddProject}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Project
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 7. CERTIFICATIONS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('certifications')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Certifications ({certifications.length})</span>
                </div>
                {activeAccordion === 'certifications' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'certifications' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveCertification(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Certification #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Name</label>
                              <input
                                type="text"
                                placeholder="AWS Solutions Architect"
                                value={cert.name}
                                onChange={(e) => handleUpdateCertification(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Issuer</label>
                              <input
                                type="text"
                                placeholder="Amazon Web Services"
                                value={cert.issuer}
                                onChange={(e) => handleUpdateCertification(idx, 'issuer', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1 col-span-2">
                              <label className="text-[9px] font-bold text-slate-400">Certificate URL</label>
                              <input
                                type="text"
                                placeholder="aws.cert.com/id"
                                value={cert.url}
                                onChange={(e) => handleUpdateCertification(idx, 'url', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Issue Date</label>
                              <input
                                type="text"
                                placeholder="Jun 2025"
                                value={cert.date}
                                onChange={(e) => handleUpdateCertification(idx, 'date', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddCertification}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Certification
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 8. LANGUAGES */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('languages')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>Languages ({languages.length})</span>
                </div>
                {activeAccordion === 'languages' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'languages' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {languages.map((lang, idx) => (
                        <div key={idx} className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveLanguage(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Language #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Language</label>
                              <input
                                type="text"
                                placeholder="Spanish"
                                value={lang.language}
                                onChange={(e) => handleUpdateLanguage(idx, 'language', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Proficiency</label>
                              <input
                                type="text"
                                placeholder="Native / Professional"
                                value={lang.proficiency}
                                onChange={(e) => handleUpdateLanguage(idx, 'proficiency', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddLanguage}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Language
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 9. SECTION SORTING AND LAYOUT STRUCTURE WIDGET */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('layout')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Laptop className="w-4 h-4 text-indigo-500" />
                  <span>Section Layout Ordering</span>
                </div>
                {activeAccordion === 'layout' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'layout' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-3 text-left">
                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                        Drag or sort sections to adjust layout hierarchy. Recalculates resume structure in real-time.
                      </p>
                      
                      <div className="space-y-1.5">
                        {sectionOrder.map((sectionName, idx) => (
                          <div 
                            key={sectionName} 
                            className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl"
                          >
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{sectionName}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSection(idx, -1)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === sectionOrder.length - 1}
                                onClick={() => moveSection(idx, 1)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </motion.div>

        {/* RIGHT WORKSPACE: Real-time Live Resume Preview Panel */}
        <motion.div 
          variants={slideUp}
          className="flex-1 bg-slate-200/50 dark:bg-slate-900/30 overflow-y-auto p-6 md:p-8 flex justify-center items-start"
        >
          
          {/* Main Visual Render Page sheet standard */}
          <div id="resume-preview-sheet" className={`w-full max-w-[800px] min-h-[980px] bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-xl border border-slate-300/40 dark:border-slate-800/80 rounded-lg ${dynamicStyles.sheetPadding} flex flex-col justify-start text-left relative overflow-hidden transition-all duration-300`}>
            
            {/* Header branding overlay */}
            <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${
              templateId === 'modern' ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400' :
              templateId === 'minimalist' ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
              'bg-slate-900'
            }`} />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, y: 6, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.995 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className={`flex flex-col justify-start w-full ${
                  templateId === 'classic' ? 'font-serif' : 'font-sans'
                }`}
              >
                <div className="flex flex-col justify-start w-full">
              {/* Dynamic Header Section (Personal details) based on templateId */}
              {templateId === 'modern' ? (
                <header className="pb-6 border-b border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-end font-sans">
                  <div>
                    <h1 className="font-display font-extrabold tracking-tight text-slate-900 dark:text-slate-100 text-2xl sm:text-3xl">
                      {personalInfo.fullName || 'YOUR FULL NAME'}
                    </h1>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wide">
                      {experience[0]?.position || 'Target Professional Role'}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-4 sm:mt-0 sm:text-right font-sans">
                    {personalInfo.email ? (
                      <a href={`mailto:${personalInfo.email}`} className="hover:underline block text-inherit break-all">
                        {personalInfo.email}
                      </a>
                    ) : (
                      <p>{'email@address.com'}</p>
                    )}
                    <p>{personalInfo.phone || '+1 (555) 000-0000'}</p>
                    <p>{personalInfo.location || 'Location Area, State'}</p>
                    <div className="flex gap-3 justify-start sm:justify-end">
                      {personalInfo.website && (
                        <a 
                          href={normalizeUrl(personalInfo.website)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-[10px] text-inherit break-all"
                        >
                          {personalInfo.website}
                        </a>
                      )}
                      {personalInfo.github && (
                        <a 
                          href={normalizeUrl(personalInfo.github)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-[10px] text-inherit break-all"
                        >
                          {personalInfo.github}
                        </a>
                      )}
                      {personalInfo.linkedin && (
                        <a 
                          href={normalizeUrl(personalInfo.linkedin)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-[10px] text-inherit break-all"
                        >
                          {personalInfo.linkedin}
                        </a>
                      )}
                    </div>
                  </div>
                </header>
              ) : templateId === 'minimalist' ? (
                <header className="pb-5 border-b border-slate-200 dark:border-slate-800 text-left font-sans">
                  <h1 className="text-2xl font-bold tracking-wider text-slate-900 dark:text-slate-100 uppercase font-sans">
                    {personalInfo.fullName || 'YOUR FULL NAME'}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-[0.2em] font-sans mt-0.5">
                    {experience[0]?.position || 'Target Professional Role'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-450 dark:text-slate-500 font-normal tracking-wide pt-2.5 font-sans">
                    {personalInfo.email ? (
                      <a href={`mailto:${personalInfo.email}`} className="hover:underline text-inherit break-all">
                        {personalInfo.email}
                      </a>
                    ) : (
                      <span>{'email@address.com'}</span>
                    )}
                    {personalInfo.phone && <span>· {personalInfo.phone}</span>}
                    {personalInfo.location && <span>· {personalInfo.location}</span>}
                    {personalInfo.website && (
                      <span className="text-inherit">
                        ·{' '}
                        <a 
                          href={normalizeUrl(personalInfo.website)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-inherit break-all"
                        >
                          {personalInfo.website}
                        </a>
                      </span>
                    )}
                    {personalInfo.github && (
                      <span className="text-inherit">
                        ·{' '}
                        <a 
                          href={normalizeUrl(personalInfo.github)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-inherit break-all"
                        >
                          {personalInfo.github}
                        </a>
                      </span>
                    )}
                    {personalInfo.linkedin && (
                      <span className="text-inherit">
                        ·{' '}
                        <a 
                          href={normalizeUrl(personalInfo.linkedin)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-inherit break-all"
                        >
                          {personalInfo.linkedin}
                        </a>
                      </span>
                    )}
                  </div>
                </header>
              ) : (
                <header className="pb-5 text-center font-serif">
                  <h1 className="font-serif font-bold text-3xl text-slate-950 dark:text-slate-50 tracking-tight leading-tight">
                    {personalInfo.fullName || 'YOUR FULL NAME'}
                  </h1>
                  <p className="text-xs italic font-serif text-slate-700 dark:text-slate-400 mt-1 uppercase tracking-wider">
                    {experience[0]?.position || 'Target Professional Role'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-2.5 mt-2.5 text-[11px] text-slate-600 dark:text-slate-400 font-serif">
                    {personalInfo.email ? (
                      <a href={`mailto:${personalInfo.email}`} className="hover:underline text-inherit break-all">
                        {personalInfo.email}
                      </a>
                    ) : (
                      <span>{'email@address.com'}</span>
                    )}
                    {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                    {personalInfo.location && <span>| {personalInfo.location}</span>}
                    {personalInfo.website && (
                      <span className="text-inherit">
                        |{' '}
                        <a 
                          href={normalizeUrl(personalInfo.website)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-inherit break-all"
                        >
                          {personalInfo.website}
                        </a>
                      </span>
                    )}
                    {personalInfo.github && (
                      <span className="text-inherit">
                        |{' '}
                        <a 
                          href={normalizeUrl(personalInfo.github)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-inherit break-all"
                        >
                          {personalInfo.github}
                        </a>
                      </span>
                    )}
                    {personalInfo.linkedin && (
                      <span className="text-inherit">
                        |{' '}
                        <a 
                          href={normalizeUrl(personalInfo.linkedin)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-inherit break-all"
                        >
                          {personalInfo.linkedin}
                        </a>
                      </span>
                    )}
                  </div>
                  <div className="border-b-2 border-slate-950 dark:border-slate-800 mt-4.5 w-full" />
                </header>
              )}

              {/* Dynamic Render Loop of active sections based on sectionOrder */}
              <div className={`${dynamicStyles.sectionMargin} ${dynamicStyles.sectionSpace}`}>
                {sectionOrder.map((sectionName) => {
                               // Summary Section
                  if (sectionName === 'summary' && summary) {
                    return (
                      <section key="summary" className={dynamicStyles.itemSpace}>
                        {templateId === 'modern' ? (
                          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">
                            Professional Summary
                          </h2>
                        ) : templateId === 'minimalist' ? (
                          <h2 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800 pb-1.5 font-sans">
                            Professional Summary
                          </h2>
                        ) : (
                          <h2 className="text-xs font-bold text-slate-950 dark:text-slate-50 uppercase tracking-wider border-b-2 border-slate-950 dark:border-slate-805 pb-0.5 font-serif">
                            Professional Summary
                          </h2>
                        )}
                        <p className={`text-xs leading-relaxed break-words ${
                          templateId === 'modern' ? 'text-slate-600 dark:text-slate-300 font-sans' :
                          templateId === 'minimalist' ? 'text-slate-600 dark:text-slate-400 font-normal font-sans' :
                          'text-slate-700 dark:text-slate-300 font-serif'
                        }`}>
                          {summary}
                        </p>
                      </section>
                    );
                  }

                  // Work Experience Section
                  if (sectionName === 'experience' && experience.length > 0) {
                    return (
                      <section key="experience" className={dynamicStyles.itemSpace}>
                        {templateId === 'modern' ? (
                          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">
                            Professional Experience
                          </h2>
                        ) : templateId === 'minimalist' ? (
                          <h2 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800 pb-1.5 font-sans">
                            Professional Experience
                          </h2>
                        ) : (
                          <h2 className="text-xs font-bold text-slate-950 dark:text-slate-50 uppercase tracking-wider border-b-2 border-slate-950 dark:border-slate-805 pb-0.5 font-serif">
                            Professional Experience
                          </h2>
                        )}
                        <div className={dynamicStyles.expListSpace}>
                          {experience.map((exp, idx) => {
                            if (templateId === 'modern') {
                              return (
                                <div key={idx} className="space-y-1 font-sans">
                                  <div className="flex justify-between items-start text-xs font-sans">
                                    <div>
                                      <span className="font-bold text-slate-900 dark:text-slate-100">{exp.position || 'Position Title'}</span>
                                      <span className="mx-1.5 text-slate-350 dark:text-slate-700">|</span>
                                      <span className="font-semibold text-slate-600 dark:text-slate-400">{exp.company || 'Company'}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                      {exp.startDate || 'Date'} — {exp.current ? 'Present' : exp.endDate || 'Date'}
                                    </span>
                                  </div>
                                  {exp.location && <p className="text-[10px] text-slate-400 font-sans">{exp.location}</p>}
                                  {exp.description && (
                                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 font-sans break-words">
                                      {exp.description.split('\n').map((bullet, bIdx) => (
                                        <li key={bIdx} className="break-words">{bullet.replace(/^- /, '')}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            } else if (templateId === 'minimalist') {
                              return (
                                <div key={idx} className="space-y-1 font-sans text-xs">
                                  <div className="flex justify-between items-baseline font-sans">
                                    <div>
                                      <span className="font-bold text-slate-900 dark:text-slate-100">{exp.position || 'Position Title'}</span>
                                      <span className="mx-1.5 text-slate-400 dark:text-slate-700">·</span>
                                      <span className="font-normal text-slate-600 dark:text-slate-400">{exp.company || 'Company'}</span>
                                      {exp.location && <span className="text-[10px] text-slate-450 dark:text-slate-500 font-normal ml-2">({exp.location})</span>}
                                    </div>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-normal whitespace-nowrap">
                                      {exp.startDate || 'Date'} — {exp.current ? 'Present' : exp.endDate || 'Date'}
                                    </span>
                                  </div>
                                  {exp.description && (
                                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-0.5 pt-0.5 font-sans break-words">
                                      {exp.description.split('\n').map((bullet, bIdx) => (
                                        <li key={bIdx} className="break-words">{bullet.replace(/^- /, '')}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            } else {
                              // classic traditional Wall Street layout (school/company left, date/location right)
                              return (
                                <div key={idx} className="space-y-0.5 font-serif text-xs">
                                  <div className="flex justify-between items-baseline font-serif">
                                    <span className="font-bold text-slate-950 dark:text-slate-50">{exp.company || 'Company'}</span>
                                    <span className="text-[11px] text-slate-650 dark:text-slate-400 italic">
                                      {exp.location || 'Location'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-baseline font-serif text-[11px]">
                                    <span className="italic text-slate-750 dark:text-slate-350">{exp.position || 'Position Title'}</span>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-450 whitespace-nowrap">
                                      {exp.startDate || 'Date'} — {exp.current ? 'Present' : exp.endDate || 'Date'}
                                    </span>
                                  </div>
                                  {exp.description && (
                                    <ul className="list-disc pl-4 text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5 pt-0.5 font-serif break-words">
                                      {exp.description.split('\n').map((bullet, bIdx) => (
                                        <li key={bIdx} className="break-words">{bullet.replace(/^- /, '')}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            }
                          })}
                        </div>
                      </section>
                    );
                  }

                  // Education Section
                  if (sectionName === 'education' && education.length > 0) {
                    return (
                      <section key="education" className={dynamicStyles.itemSpace}>
                        {templateId === 'modern' ? (
                          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">
                            Education
                          </h2>
                        ) : templateId === 'minimalist' ? (
                          <h2 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800 pb-1.5 font-sans">
                            Education
                          </h2>
                        ) : (
                          <h2 className="text-xs font-bold text-slate-950 dark:text-slate-50 uppercase tracking-wider border-b-2 border-slate-950 dark:border-slate-805 pb-0.5 font-serif">
                            Education
                          </h2>
                        )}
                        <div className={dynamicStyles.eduListSpace}>
                          {education.map((edu, idx) => {
                            if (templateId === 'modern') {
                              return (
                                <div key={idx} className="flex justify-between items-start text-xs font-sans">
                                  <div>
                                    <span className="font-bold text-slate-850 dark:text-slate-200">{edu.degree || 'Degree Major'}</span>
                                    <span className="mx-1.5 text-slate-350 dark:text-slate-700">|</span>
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">{edu.school || 'School'}</span>
                                    {edu.location && <span className="text-[10px] text-slate-400 ml-2">({edu.location})</span>}
                                  </div>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                    {edu.startDate || 'Date'} — {edu.endDate || 'Date'}
                                  </span>
                                </div>
                              );
                            } else if (templateId === 'minimalist') {
                              return (
                                <div key={idx} className="space-y-0.5 text-xs font-sans">
                                  <div className="flex justify-between items-baseline font-sans">
                                    <div>
                                      <span className="font-bold text-slate-900 dark:text-slate-100">{edu.degree || 'Degree Major'}</span>
                                      <span className="mx-1.5 text-slate-400 dark:text-slate-750">·</span>
                                      <span className="font-normal text-slate-600 dark:text-slate-400">{edu.school || 'School'}</span>
                                      {edu.location && <span className="text-[10px] text-slate-450 dark:text-slate-500 font-normal ml-2">({edu.location})</span>}
                                    </div>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-normal whitespace-nowrap">
                                      {edu.startDate} — {edu.endDate}
                                    </span>
                                  </div>
                                </div>
                              );
                            } else {
                              // classic traditional Wall Street style
                              return (
                                <div key={idx} className="space-y-0.5 font-serif text-xs">
                                  <div className="flex justify-between items-baseline font-serif">
                                    <span className="font-bold text-slate-950 dark:text-slate-50">{edu.school || 'School'}</span>
                                    <span className="text-[11px] text-slate-650 dark:text-slate-400 italic">
                                      {edu.location || 'Location'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-baseline font-serif text-[11px]">
                                    <span className="italic text-slate-750 dark:text-slate-350">{edu.degree || 'Degree Major'}</span>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-450 whitespace-nowrap">
                                      {edu.startDate || 'Date'} — {edu.endDate || 'Date'}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </section>
                    );
                  }

                  // Technical Skills Section
                  if (sectionName === 'skills' && skills.length > 0) {
                    return (
                      <section key="skills" className={dynamicStyles.itemSpace}>
                        {templateId === 'modern' ? (
                          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">
                            Skills
                          </h2>
                        ) : templateId === 'minimalist' ? (
                          <h2 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800 pb-1.5 font-sans">
                            Skills
                          </h2>
                        ) : (
                          <h2 className="text-xs font-bold text-slate-950 dark:text-slate-50 uppercase tracking-wider border-b-2 border-slate-950 dark:border-slate-805 pb-0.5 font-serif">
                            Skills
                          </h2>
                        )}
                        <div className={`${dynamicStyles.skillsListSpace} text-xs`}>
                          {skills.map((skill, idx) => {
                            if (templateId === 'modern') {
                              return (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 font-sans text-xs">
                                  <span className="sm:col-span-3 font-bold text-slate-700 dark:text-slate-300 capitalize break-words">{skill.name || 'Group'}:</span>
                                  <div className="sm:col-span-9">
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                      {skill.keywords && skill.keywords.map((kw, kwIdx) => (
                                        <span key={kwIdx} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50 px-2 py-0.5 rounded-full text-[10px] font-medium break-all">
                                          {kw}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (templateId === 'minimalist') {
                              return (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-1 font-sans text-xs">
                                  <span className="font-bold text-slate-900 dark:text-slate-100 w-28 shrink-0 capitalize break-words">{skill.name || 'Group'}:</span>
                                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                                    {skill.keywords && skill.keywords.map((kw, kwIdx) => (
                                      <span key={kwIdx} className="text-slate-600 dark:text-slate-400 font-normal break-all">
                                        {kw}{kwIdx < skill.keywords.length - 1 ? ' ·' : ''}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            } else {
                              // classic traditional
                              return (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 font-serif text-xs">
                                  <span className="font-bold text-slate-950 dark:text-slate-100 w-32 shrink-0 capitalize break-words">{skill.name || 'Group'}:</span>
                                  <div className="flex flex-wrap gap-x-1.5 gap-y-1">
                                    {skill.keywords && skill.keywords.map((kw, kwIdx) => (
                                      <span key={kwIdx} className="text-slate-700 dark:text-slate-350 break-all">
                                        {kw}{kwIdx < skill.keywords.length - 1 ? ',' : ''}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </section>
                    );
                  }

                   // Projects Section
                  if (sectionName === 'projects' && projects.length > 0) {
                    return (
                      <section key="projects" className={dynamicStyles.itemSpace}>
                        {templateId === 'modern' ? (
                          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">
                            Projects
                          </h2>
                        ) : templateId === 'minimalist' ? (
                          <h2 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800 pb-1.5 font-sans">
                            Projects
                          </h2>
                        ) : (
                          <h2 className="text-xs font-bold text-slate-950 dark:text-slate-50 uppercase tracking-wider border-b-2 border-slate-950 dark:border-slate-805 pb-0.5 font-serif">
                            Projects
                          </h2>
                        )}
                        <div className={dynamicStyles.projListSpace}>
                          {projects.map((proj, idx) => {
                            if (templateId === 'modern') {
                              return (
                                <div key={idx} className="space-y-1 text-xs font-sans">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{proj.title || 'Project Title'}</span>
                                      {proj.role && <span className="text-[10px] text-slate-400">({proj.role})</span>}
                                      {proj.url && (
                                        <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400">{proj.startDate}</span>
                                  </div>
                                  {proj.description && <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans break-words">{proj.description}</p>}
                                </div>
                              );
                            } else if (templateId === 'minimalist') {
                              return (
                                <div key={idx} className="space-y-1 text-xs font-sans">
                                  <div className="flex justify-between items-baseline">
                                    <div className="flex items-baseline gap-2 font-sans">
                                      <span className="font-bold text-slate-900 dark:text-slate-100 break-words">{proj.title || 'Project Title'}</span>
                                      {proj.role && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal break-words">({proj.role})</span>}
                                    </div>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-normal">{proj.startDate}</span>
                                  </div>
                                  {proj.description && <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans break-words">{proj.description}</p>}
                                </div>
                              );
                            } else {
                              // classic traditional
                              return (
                                <div key={idx} className="space-y-0.5 text-xs font-serif">
                                  <div className="flex justify-between items-baseline font-serif">
                                    <div className="flex items-baseline gap-2 font-serif">
                                      <span className="font-bold text-slate-950 dark:text-slate-50 break-words">{proj.title || 'Project Title'}</span>
                                      {proj.role && <span className="text-[11px] text-slate-650 dark:text-slate-400 italic break-words">({proj.role})</span>}
                                    </div>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-450 italic">{proj.startDate}</span>
                                  </div>
                                  {proj.description && <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif break-words">{proj.description}</p>}
                                </div>
                              );
                            }
                          })}
                        </div>
                      </section>
                    );
                  }

                  // Certifications Section
                  if (sectionName === 'certifications' && certifications.length > 0) {
                    return (
                      <section key="certifications" className={dynamicStyles.itemSpace}>
                        {templateId === 'modern' ? (
                          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">
                            Certifications
                          </h2>
                        ) : templateId === 'minimalist' ? (
                          <h2 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800 pb-1.5 font-sans">
                            Certifications
                          </h2>
                        ) : (
                          <h2 className="text-xs font-bold text-slate-950 dark:text-slate-50 uppercase tracking-wider border-b-2 border-slate-950 dark:border-slate-805 pb-0.5 font-serif">
                            Certifications
                          </h2>
                        )}
                        <div className={`${dynamicStyles.itemSpace} text-xs`}>
                          {certifications.map((cert, idx) => {
                            if (templateId === 'modern') {
                              return (
                                <div key={idx} className="flex justify-between items-center text-xs font-sans">
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{cert.name || 'Certification Name'}</span>
                                    <span className="text-slate-400 mx-1.5">—</span>
                                    <span className="text-slate-600 dark:text-slate-400">{cert.issuer}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">{cert.date}</span>
                                </div>
                              );
                            } else if (templateId === 'minimalist') {
                              return (
                                <div key={idx} className="flex justify-between items-baseline text-xs font-sans">
                                  <div className="flex gap-2">
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{cert.name || 'Certification Name'}</span>
                                    <span className="text-slate-500 font-normal">· {cert.issuer}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-450 font-normal">{cert.date}</span>
                                </div>
                              );
                            } else {
                              return (
                                <div key={idx} className="flex justify-between items-baseline text-xs font-serif">
                                  <div>
                                    <span className="font-bold text-slate-950 dark:text-slate-50">{cert.name || 'Certification Name'}</span>
                                    <span className="text-slate-500 mx-1.5">,</span>
                                    <span className="text-slate-700 dark:text-slate-350 italic">{cert.issuer}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-600 dark:text-slate-450">{cert.date}</span>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </section>
                    );
                  }

                  // Languages Section
                  if (sectionName === 'languages' && languages.length > 0) {
                    return (
                      <section key="languages" className={dynamicStyles.itemSpace}>
                        {templateId === 'modern' ? (
                          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">
                            Languages
                          </h2>
                        ) : templateId === 'minimalist' ? (
                          <h2 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800 pb-1.5 font-sans">
                            Languages
                          </h2>
                        ) : (
                          <h2 className="text-xs font-bold text-slate-950 dark:text-slate-50 uppercase tracking-wider border-b-2 border-slate-950 dark:border-slate-805 pb-0.5 font-serif">
                            Languages
                          </h2>
                        )}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                          {languages.map((lang, idx) => {
                            if (templateId === 'modern') {
                              return (
                                <div key={idx} className="flex items-center gap-1.5 text-xs font-sans">
                                  <span className="font-bold text-slate-750 dark:text-slate-300">{lang.language}</span>
                                  {lang.proficiency && <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 border px-1.5 py-0.5 rounded">({lang.proficiency})</span>}
                                </div>
                              );
                            } else if (templateId === 'minimalist') {
                              return (
                                <div key={idx} className="flex items-baseline gap-1.5 text-xs font-sans">
                                  <span className="font-medium text-slate-850 dark:text-slate-250">{lang.language}</span>
                                  {lang.proficiency && <span className="text-[10px] text-slate-450 font-light">({lang.proficiency})</span>}
                                </div>
                              );
                            } else {
                              return (
                                <div key={idx} className="flex items-baseline gap-1.5 text-xs font-serif">
                                  <span className="font-bold text-slate-950 dark:text-slate-50">{lang.language}</span>
                                  {lang.proficiency && <span className="text-[11px] text-slate-650 dark:text-slate-400 italic">({lang.proficiency})</span>}
                                </div>
                              );
                            }
                          })}
                        </div>
                      </section>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </motion.div>

      </div>


      {/* Upload Existing Resume Dialog Overlay */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-left"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-100" />
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide">Upload Existing Resume</h3>
                    <p className="text-[10px] text-indigo-100 font-medium">Import a PDF or DOCX into the builder schema</p>
                  </div>
                </div>
                <button
                  onClick={closeUploadModal}
                  disabled={isImportingResume}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/40 text-center">
                  <Upload className="w-9 h-9 mx-auto text-indigo-500 mb-3" />
                  <label className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/20">
                    Choose PDF or DOCX
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeFileChange}
                      disabled={isImportingResume}
                      className="sr-only"
                    />
                  </label>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedResumeFile ? selectedResumeFile.name : 'Supported formats: .pdf and .docx'}
                  </p>
                </div>

                {uploadError && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  CareerForge will extract text, use AI to map it into your existing resume fields, update this builder, and save through the current save flow.
                </p>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 text-xs shrink-0">
                <button
                  onClick={closeUploadModal}
                  disabled={isImportingResume}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResumeImport}
                  disabled={isImportingResume || !selectedResumeFile}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImportingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{isImportingResume ? 'Importing...' : 'Import Resume'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Streaming AI Magic Optimizer Dialog Overlay */}
      <AnimatePresence>
        {isOptimizerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-left"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse text-purple-200" />
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide">
                      CareerForge AI Spark Assistant
                    </h3>
                    <p className="text-[10px] text-indigo-100 font-medium">
                      Real-time professional stream optimizer
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOptimizerOpen(false)}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
                {/* Configuration panel */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optimize Action</label>
                    <select
                      value={magicPromptType}
                      onChange={(e) => setMagicPromptType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="summary_rewrite">Professional Bio Rewrite</option>
                      <option value="bullet_rewrite">Resume Bullet Rewrite</option>
                      <option value="quantify">Quantify Achievements (+ Metrics)</option>
                      <option value="ats_inject">ATS Keyword Injection Focus</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-indigo-500" /> Focus Keyword (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AWS, React, Kubernetes..."
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Original content comparison */}
                {originalText && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Text</label>
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs text-slate-500 dark:text-slate-400 line-clamp-3 select-none">
                      {originalText}
                    </div>
                  </div>
                )}

                {/* Live stream block */}
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI Generated Suggestion
                  </label>
                  
                  <div className="relative">
                    <textarea
                      rows={6}
                      readOnly
                      placeholder="Click 'Generate Suggestions' to initiate the streaming optimizer. The model will draft modern, impact-driven sentences in real time."
                      value={optimizedText}
                      className="w-full px-4 py-3 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/60 focus:outline-none rounded-2xl text-xs leading-relaxed font-medium text-slate-800 dark:text-slate-100 resize-none shadow-inner"
                    />
                    {isOptimizing && (
                      <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-950/10 backdrop-blur-[0.5px] rounded-2xl flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border rounded-xl shadow-lg">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Streaming tokens...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] font-medium text-slate-400">
                    Remaining credits: <span className="font-bold text-slate-600 dark:text-slate-300">{planStats.aiLimit === Infinity ? 'Unlimited' : `${planStats.aiLimit - planStats.aiRewriteCount} free credits left`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOptimizing ? (
                      <button
                        type="button"
                        onClick={cancelOptimization}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startStreamOptimization}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Optimizations</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!optimizedText || isOptimizing}
                      onClick={applySuggestion}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Changes</span>
                    </button>
                  </div>
                </div>

                {/* Audit trail & Rollbacks */}
                {historyLogs.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      History / Undo Actions
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {historyLogs.slice(0, 3).map((log) => (
                        <div
                          key={log._id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs"
                        >
                          <div className="space-y-0.5 text-left min-w-0">
                            <div className="font-bold capitalize text-slate-700 dark:text-slate-300">
                              {log.actionType.replace('_', ' ')}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[320px]">
                              {log.generatedContent}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => rollbackSuggestion(log._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold border border-amber-200/40 dark:border-amber-900/40 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Undo</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATS Score Breakdown detailed report modal */}
      <AnimatePresence>
        {showAtsReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-left font-sans animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-950 px-6 py-4 flex items-center justify-between text-white shrink-0 border-b border-slate-200/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Target className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide">
                      ATS Real-time Compliance Audit
                    </h3>
                    <p className="text-[10px] text-slate-300 font-medium">
                      High-fidelity screening simulation report
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAtsReportModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Score Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Keyword Score card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keyword Match</div>
                      <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                        {safeAtsMetadata.score}%
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          safeAtsMetadata.score >= 80 ? 'bg-emerald-500' : safeAtsMetadata.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${safeAtsMetadata.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Skills Score Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formatting Check</div>
                      <div className="text-2xl font-extrabold text-emerald-500 mt-1 flex items-center gap-1.5">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <span>Pass</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold mt-3">
                      Standard layout and parsing readable.
                    </p>
                  </div>

                  {/* AI Recommendation Match */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Impact</div>
                      <div className="text-2xl font-extrabold text-indigo-500 mt-1">
                        {safeAtsMetadata.score >= 80 ? 'Strong' : safeAtsMetadata.score >= 60 ? 'Moderate' : 'Weak'}
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold mt-3">
                      Quantifiable work descriptions.
                    </p>
                  </div>
                </div>

                {/* Keyword Compliance */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-indigo-500" />
                      <span>Keyword Compliance Breakdown</span>
                    </h4>
                    <input
                      type="text"
                      placeholder="Filter keywords..."
                      value={modalKeywordSearch}
                      onChange={(e) => setModalKeywordSearch(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] focus:outline-none focus:border-indigo-500 w-full sm:w-44"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matched Keywords */}
                    <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl p-4 space-y-2">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Matched Keywords ({dynamicAtsData.matchedKeywords.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dynamicAtsData.matchedKeywords
                          .filter(k => k.toLowerCase().includes(modalKeywordSearch.toLowerCase()))
                          .map(k => (
                            <span key={k} className="px-2 py-0.5 bg-emerald-100/40 dark:bg-emerald-900/30 border border-emerald-200/20 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-[9px] font-bold flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              {k}
                            </span>
                          ))}
                        {dynamicAtsData.matchedKeywords.filter(k => k.toLowerCase().includes(modalKeywordSearch.toLowerCase())).length === 0 && (
                          <span className="text-[9px] text-slate-400">No matching keywords found.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-4 space-y-2">
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Missing Keywords ({dynamicAtsData.missingKeywords.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dynamicAtsData.missingKeywords
                          .filter(k => k.toLowerCase().includes(modalKeywordSearch.toLowerCase()))
                          .map(k => (
                            <span key={k} className="px-2 py-0.5 bg-amber-100/40 dark:bg-rose-950/20 border border-amber-200/20 dark:border-rose-900/30 text-amber-700 dark:text-rose-400 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer hover:border-indigo-500" title="Click to auto-fix or optimize" onClick={() => {
                              openMagicOptimizer('bullet', '', (newVal) => {
                                alert(`Suggested optimized sentence to inject:\n\n${newVal}`);
                              });
                            }}>
                              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                              {k}
                            </span>
                          ))}
                        {dynamicAtsData.missingKeywords.filter(k => k.toLowerCase().includes(modalKeywordSearch.toLowerCase())).length === 0 && (
                          <span className="text-[9px] text-slate-400">No missing keywords! All matched.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Optimization Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-indigo-500 animate-bounce" />
                    <span>AI Strategic Advice</span>
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                    {safeAtsMetadata.feedback && safeAtsMetadata.feedback.length > 0 ? (
                      safeAtsMetadata.feedback.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 text-xs">
                          <span className="text-indigo-500 font-bold">0{idx + 1}.</span>
                          <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{item}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex gap-2.5 text-xs">
                        <span className="text-indigo-500 font-bold">01.</span>
                        <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Select one of our premium job presets or paste a target job description to run a detailed multi-vector parser simulation.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs shrink-0">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  CareerForge Pro ATS v2.1
                </span>
                <button
                  onClick={() => setShowAtsReportModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Builder;

