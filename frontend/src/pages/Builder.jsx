import { useEffect, useState, useMemo } from 'react';
import PersonalSection from '../components/PersonalSection';
import ExperienceSection from '../components/ExperienceSection';
import SkillsSection from '../components/SkillsSection';
import CertificationsSection from '../components/CertificationsSection';
import LanguagesSection from '../components/LanguagesSection';
import ProjectsSection from '../components/ProjectsSection';
import EducationSection from '../components/EducationSection';
import SummarySection from '../components/SummarySection';
import UploadResumeModal from '../components/UploadResumeModal';
import MagicOptimizerModal from '../components/MagicOptimizerModal';
import ATSReportModal from '../components/ATSReportModal';
import DeleteModal from '../components/DeleteModal';

import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { useAuthStore } from '../store/authStore';
import { isPremiumTemplate, isProUser } from '../utils/planConstants';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitions, slideUp } from '../animations/pageTransitions';
import { ArrowLeft, Save, ArrowUp, ArrowDown, Eye, // eslint-disable-line no-unused-vars
  ChevronDown, ChevronUp, AlertTriangle, Info, // eslint-disable-line no-unused-vars
  ExternalLink, Laptop, Sparkles, Brain, Check, RotateCcw, X, Target, Loader2, Palette, Download, Upload, Lock } from 'lucide-react';

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
  const _navigate = useNavigate();
  
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState('');
  const [alertModalTitle, setAlertModalTitle] = useState('Notice');
  const { user } = useAuthStore();
  const isPro = isProUser(user);
  const [searchParams, setSearchParams] = useSearchParams();
  const isOptimizeMode = searchParams.get('mode') === 'optimize';
  const { 
    currentResume, 
    loadResumeById, 
    updateResumeLocal, 
    saveResumeImmediately,
    invalidatePendingResumeLoads,
    exportResumePdf,
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
  const [showProBanner, setShowProBanner] = useState(false);
  const [activeTheme, setActiveTheme] = useState('modern');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportSuccess, setIsExportSuccess] = useState(false);
  const [manualSavePerformed, setManualSavePerformed] = useState(false);
  const [showAutoSaveModal, setShowAutoSaveModal] = useState(false);
  const [dontShowAutoSaveWarning, setDontShowAutoSaveWarning] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsExportingPdf(true);
    const handleAfterPrint = () => setIsExportingPdf(false);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (currentResume?.templateId) {
      const nextTheme = isPremiumTemplate(currentResume.templateId) && !isPro
        ? 'modern'
        : currentResume.templateId;
      setActiveTheme(nextTheme);
    }
  }, [currentResume?.templateId, isPro]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // State abstractions for JD ATS Check & AI Optimization
  const [jdText, setJdText] = useState('');
  const [isJdAnalyzing, setIsJdAnalyzing] = useState(false);
  const [_atsBreakdown, setAtsBreakdown] = useState(null);
  const [isJdOpen, setIsJdOpen] = useState(true);

  // Live Demo, Confetti, & ATS Modal States
  const [_demoModeActive, setDemoModeActive] = useState(false);
  const [selectedJdPreset, setSelectedJdPreset] = useState('');
  const [analyzedJdPreset, setAnalyzedJdPreset] = useState('');
  const [analyzedJdText, setAnalyzedJdText] = useState('');
  const [showAtsReportModal, setShowAtsReportModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Pre-computed stable particle data — avoids Math.random() during render
  /* eslint-disable react-hooks/purity */
  const confettiParticles = useMemo(() => {
    if (!showConfetti) return [];
    return [...Array(15)].map((_, i) => {
      const angle = (i / 15) * 2 * Math.PI;
      const velocity = 35 + Math.random() * 40;
      return {
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        rotate: Math.random() * 360,
        color: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5],
      };
    });
  }, [showConfetti]);
  /* eslint-enable react-hooks/purity */
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

    const uniqueMatched = [...new Set(meta.keywordsFound || [])];
    const uniqueMissing = [...new Set(meta.keywordsMissing || [])];

    const totalCount = uniqueMatched.length + uniqueMissing.length;
    const keywordMatchPercent = totalCount > 0 ? Math.round((uniqueMatched.length / totalCount) * 100) : 0;

    return {
      matchedKeywords: uniqueMatched,
      missingKeywords: uniqueMissing,
      keywordMatchPercent,
      score: meta.score || 0,
      density: {},
      feedback: meta.feedback || []
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResume]);

  // Destructure resume sections with fallbacks
  const {
    title = '',
    templateId: _storeTemplateId = 'modern',
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
  const [_optimizerType, setOptimizerType] = useState('summary'); // 'summary' | 'bullet'
  const [originalText, setOriginalText] = useState('');
  const [optimizedText, setOptimizedText] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [magicPromptType, setMagicPromptType] = useState('summary_rewrite');
  const [isOptimizing, setIsOptimizing] = useState(false);
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

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchPlanStats();
    fetchHistoryLogs();
  }, [id]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  // Set initial animatedScore when resume loads
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (activeAtsScore) {
      setAnimatedScore(activeAtsScore);
    } else {
      setAnimatedScore(0);
    }
  }, [activeAtsScore]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } catch (_networkError) {
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
    if (!currentVal || !currentVal.trim()) return;
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
      const allTarget = [...dynamicAtsData.matchedKeywords, ...dynamicAtsData.missingKeywords];
      return allTarget.slice(0, 8).join(', ');
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
            } catch (_e) {
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
          setAlertModalTitle('Original Content Restored');
          setAlertModalContent('Original summary successfully restored.');
          setAlertModalOpen(true);
        } else if (log.actionType === 'bullet_rewrite' && experience.findIndex(exp => exp.description.trim() === log.generatedContent.trim()) !== -1) {
          const matchIndex = experience.findIndex(exp => exp.description.trim() === log.generatedContent.trim());
          handleUpdateExperience(matchIndex, 'description', data.originalContent);
          setAlertModalTitle('Original Content Restored');
          setAlertModalContent('Original experience bullet successfully restored.');
          setAlertModalOpen(true);
        } else {
          setAlertModalTitle('Original Content Restored');
          setAlertModalContent(`Original content restored! Copied to clipboard:\n\n${data.originalContent}`);
          setAlertModalOpen(true);
          navigator.clipboard.writeText(data.originalContent);
        }
        fetchHistoryLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load the specific resume on mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadResumeById(id);
    setLocalSkillsText({});
  }, [id, loadResumeById]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Reset manual save state when autoSave is enabled again
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (autoSaveEnabled) {
      setManualSavePerformed(false);
    }
  }, [autoSaveEnabled]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sync visual saving feedback with Auto Save Toggle requirements
  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  // Unsaved changes beforeunload protection and visibility flush
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnsavedChanges) {
        useResumeStore.getState().saveResumeImmediately();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasUnsavedChanges]);

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
      invalidatePendingResumeLoads();
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

  const handleToggleAutoSave = () => {
    if (!autoSaveEnabled) {
      setAutoSaveEnabled(true);
      return;
    }
    const hideWarning = localStorage.getItem('cf_hide_autosave_warning') === 'true';
    if (hideWarning) {
      setAutoSaveEnabled(false);
    } else {
      setShowAutoSaveModal(true);
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={pageTransitions}
      className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col"
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
          {!isOptimizeMode && (
            <button
              onClick={() => setSearchParams(prev => { prev.set('mode', 'optimize'); return prev; })}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 cursor-pointer active:scale-95"
            >
              <span>ATS Optimize</span>
            </button>
          )}

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
              onClick={handleToggleAutoSave}
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
                  ].map((t) => {
                    const locked = isPremiumTemplate(t.id) && !isPro;
                    return (
                    <button
                      key={t.id}
                      onClick={async () => {
                        if (locked) {
                          setShowProBanner(true);
                          setThemeDropdownOpen(false);
                          return;
                        }
                        setShowProBanner(false);
                        setActiveTheme(t.id);
                        updateResumeLocal({ templateId: t.id });
                        setThemeDropdownOpen(false);
                        await saveResumeImmediately();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors duration-150 text-xs
                        ${locked ? 'opacity-50 cursor-pointer' : 'cursor-pointer'}
                        ${activeTheme === t.id
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 font-medium'
                        }
                      `}
                    >
                      <span className="flex items-center gap-1.5">
                        {t.label}
                        {locked && <Lock className="w-3 h-3 text-amber-500" />}
                      </span>
                      {activeTheme === t.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  );})}
                </div>
              </>
            )}

            {/* Pro upgrade panel — appears when FREE user clicks a locked template */}
            {showProBanner && (
              <div className="absolute inset-x-0 top-full mt-2 z-50 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800/60 rounded-xl shadow-xl p-3 space-y-2.5">
                <div className="flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-snug flex-1">
                    Classic &amp; Minimalist templates require Pro.
                  </p>
                  <button
                    onClick={() => setShowProBanner(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => _navigate('/billing')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  Upgrade Now →
                </button>
              </div>
            )}
          </div>

          {!autoSaveEnabled && (
            <button
              onClick={handleForceSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Now</span>
            </button>
          )}

          <button
            onClick={async () => {
              setIsExportingPdf(true);
              await exportResumePdf(id, currentResume?.title || 'resume');
              setIsExportingPdf(false);
              setIsExportSuccess(true);
              setTimeout(() => setIsExportSuccess(false), 2000);
            }}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Generating PDF...' : isExportSuccess ? 'Exported' : 'Export PDF'}</span>
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
                  className="w-full py-2 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
              <div className="pt-4 text-center py-6 px-4 bg-slate-50/55 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800 space-y-2">
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
                        {confettiParticles.map((particle, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                            animate={{
                              x: particle.x,
                              y: particle.y,
                              opacity: 0,
                              scale: [0.5, 1.2, 0],
                              rotate: particle.rotate
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: particle.color }}
                          />
                        ))}
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
                        animatedScore >= 80 ? 'bg-linear-to-r from-emerald-400 to-teal-500' : animatedScore >= 60 ? 'bg-amber-400' : 'bg-red-400'
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

                <button
                  type="button"
                  onClick={() => setShowAtsReportModal(true)}
                  className="w-full py-2 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  View Detailed ATS Report
                </button>

                {/* Keyword gaps list (Searchable, fully responsive) */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ATS Keyword Visualizer</h6>
                    <input
                      type="text"
                      placeholder="Filter keywords..."
                      value={keywordSearch}
                      onChange={(e) => setKeywordSearch(e.target.value)}
                      className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] focus:outline-none focus:border-indigo-500 w-24 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                                setAlertModalTitle('Suggestion Ready');
                                setAlertModalContent(`Suggested optimized sentence to inject:\n\n${newVal}`);
                                setAlertModalOpen(true);
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
                <div className="bg-linear-to-br from-indigo-50/40 to-emerald-50/20 dark:from-slate-950/45 dark:to-slate-900/25 border border-slate-200/50 dark:border-slate-800/80 p-3.5 rounded-2xl space-y-3">
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
            <PersonalSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              personalInfo={personalInfo}
              handlePersonalInfoChange={handlePersonalInfoChange}
            />

            {/* 2. PROFESSIONAL SUMMARY */}
            <SummarySection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              summary={summary}
              handleSummaryChange={handleSummaryChange}
              openMagicOptimizer={openMagicOptimizer}
            />

            {/* 3. WORK EXPERIENCE */}
            <ExperienceSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              experience={experience}
              handleRemoveExperience={handleRemoveExperience}
              handleUpdateExperience={handleUpdateExperience}
              openMagicOptimizer={openMagicOptimizer}
              handleAddExperience={handleAddExperience}
            />

            {/* 4. EDUCATION */}
            <EducationSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              education={education}
              handleRemoveEducation={handleRemoveEducation}
              handleUpdateEducation={handleUpdateEducation}
              handleAddEducation={handleAddEducation}
            />

            {/* 5. TECHNICAL SKILLS */}
            <SkillsSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              skills={skills}
              localSkillsText={localSkillsText}
              handleRemoveSkillCategory={handleRemoveSkillCategory}
              handleUpdateSkillCategory={handleUpdateSkillCategory}
              handleAddSkillCategory={handleAddSkillCategory}
            />

            {/* 6. PROJECTS */}
            <ProjectsSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              projects={projects}
              handleRemoveProject={handleRemoveProject}
              handleUpdateProject={handleUpdateProject}
              handleAddProject={handleAddProject}
            />

            {/* 7. CERTIFICATIONS */}
            <CertificationsSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              certifications={certifications}
              handleRemoveCertification={handleRemoveCertification}
              handleUpdateCertification={handleUpdateCertification}
              handleAddCertification={handleAddCertification}
            />

            {/* 8. LANGUAGES */}
            <LanguagesSection
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              languages={languages}
              handleRemoveLanguage={handleRemoveLanguage}
              handleUpdateLanguage={handleUpdateLanguage}
              handleAddLanguage={handleAddLanguage}
            />

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
          <div id="resume-preview-sheet" className={`w-full max-w-200 min-h-245 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-xl border border-slate-300/40 dark:border-slate-800/80 rounded-lg ${dynamicStyles.sheetPadding} flex flex-col justify-start text-left relative overflow-hidden transition-all duration-300`}>
            
            {/* Header branding overlay */}
            <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${
              templateId === 'modern' ? 'bg-linear-to-r from-indigo-500 via-violet-500 to-emerald-400' :
              templateId === 'minimalist' ? 'bg-linear-to-r from-slate-300 to-slate-400' :
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
                      {personalInfo.title || experience[0]?.position || 'Target Professional Role'}
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
                          Portfolio
                        </a>
                      )}
                      {personalInfo.github && (
                        <a 
                          href={normalizeUrl(personalInfo.github)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-[10px] text-inherit break-all"
                        >
                          GitHub
                        </a>
                      )}
                      {personalInfo.linkedin && (
                        <a 
                          href={normalizeUrl(personalInfo.linkedin)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-[10px] text-inherit break-all"
                        >
                          LinkedIn
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
                    {personalInfo.title || experience[0]?.position || 'Target Professional Role'}
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
                          Portfolio
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
                          GitHub
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
                          LinkedIn
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
                    {personalInfo.title || experience[0]?.position || 'Target Professional Role'}
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
                          Portfolio
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
                          GitHub
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
                          LinkedIn
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
                        <p className={`text-xs leading-relaxed wrap-break-word ${
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
                                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 font-sans wrap-break-word">
                                      {exp.description.split('\n').map((bullet, bIdx) => (
                                        <li key={bIdx} className="wrap-break-word">{bullet.replace(/^- /, '')}</li>
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
                                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-0.5 pt-0.5 font-sans wrap-break-word">
                                      {exp.description.split('\n').map((bullet, bIdx) => (
                                        <li key={bIdx} className="wrap-break-word">{bullet.replace(/^- /, '')}</li>
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
                                    <ul className="list-disc pl-4 text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5 pt-0.5 font-serif wrap-break-word">
                                      {exp.description.split('\n').map((bullet, bIdx) => (
                                        <li key={bIdx} className="wrap-break-word">{bullet.replace(/^- /, '')}</li>
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
                                  <span className="sm:col-span-3 font-bold text-slate-700 dark:text-slate-300 capitalize wrap-break-word">{skill.name || 'Group'}:</span>
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
                                  <span className="font-bold text-slate-900 dark:text-slate-100 w-28 shrink-0 capitalize wrap-break-word">{skill.name || 'Group'}:</span>
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
                                  <span className="font-bold text-slate-950 dark:text-slate-100 w-32 shrink-0 capitalize wrap-break-word">{skill.name || 'Group'}:</span>
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
                                  {proj.description && (
                                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 font-sans wrap-break-word">
                                      {proj.description
                                        .split('\n')
                                        .map((bullet) => bullet.trim())
                                        .filter((bullet) => bullet.length > 0)
                                        .map((bullet, bIdx) => (
                                          <li key={bIdx} className="wrap-break-word">{bullet.replace(/^- /, '')}</li>
                                        ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            } else if (templateId === 'minimalist') {
                              return (
                                <div key={idx} className="space-y-1 text-xs font-sans">
                                  <div className="flex justify-between items-baseline">
                                    <div className="flex items-baseline gap-2 font-sans">
                                      <span className="font-bold text-slate-900 dark:text-slate-100 wrap-break-word">{proj.title || 'Project Title'}</span>
                                      {proj.role && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal wrap-break-word">({proj.role})</span>}
                                    </div>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-normal">{proj.startDate}</span>
                                  </div>
                                  {proj.description && (
                                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-0.5 pt-0.5 font-sans wrap-break-word">
                                      {proj.description
                                        .split('\n')
                                        .map((bullet) => bullet.trim())
                                        .filter((bullet) => bullet.length > 0)
                                        .map((bullet, bIdx) => (
                                          <li key={bIdx} className="wrap-break-word">{bullet.replace(/^- /, '')}</li>
                                        ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            } else {
                              // classic traditional
                              return (
                                <div key={idx} className="space-y-0.5 text-xs font-serif">
                                  <div className="flex justify-between items-baseline font-serif">
                                    <div className="flex items-baseline gap-2 font-serif">
                                      <span className="font-bold text-slate-950 dark:text-slate-50 wrap-break-word">{proj.title || 'Project Title'}</span>
                                      {proj.role && <span className="text-[11px] text-slate-650 dark:text-slate-400 italic wrap-break-word">({proj.role})</span>}
                                    </div>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-450 italic">{proj.startDate}</span>
                                  </div>
                                  {proj.description && (
                                    <ul className="list-disc pl-4 text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5 pt-0.5 font-serif wrap-break-word">
                                      {proj.description
                                        .split('\n')
                                        .map((bullet) => bullet.trim())
                                        .filter((bullet) => bullet.length > 0)
                                        .map((bullet, bIdx) => (
                                          <li key={bIdx} className="wrap-break-word">{bullet.replace(/^- /, '')}</li>
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
                        <div className={`${dynamicStyles.skillsListSpace} text-xs`}>
                          {certifications.map((cert, idx) => {
                            if (templateId === 'modern') {
                              return (
                                <div key={idx} className="flex justify-between items-center text-xs font-sans">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{cert.name || 'Certification Name'}</span>
                                    <span className="text-slate-400">—</span>
                                    <span className="text-slate-600 dark:text-slate-400">{cert.issuer}</span>
                                    {cert.url && (
                                      <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </span>
                                    )}
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

        {/* Hidden CareerForge Metadata for High-Fidelity Fast Track Re-Import */}
        {/* NOTE: Do NOT add opacity-0 here. Chromium's PDF engine strips opacity:0 elements from the PDF text layer, 
            breaking Fast Track import. text-white/0 (color: rgba(255,255,255,0)) is visually invisible but 
            survives the PDF text layer — confirmed via print survival audit. */}
        <div 
          className="text-[1px] text-white/0 select-none -z-50 pointer-events-none" 
          style={{ position: 'absolute' }}
          aria-hidden="true"
        >
          [CAREERFORGE_METADATA_START]
          {JSON.stringify({
            personalInfo,
            summary,
            experience,
            education,
            skills,
            certifications,
            projects,
            languages
          })}
          [CAREERFORGE_METADATA_END]
        </div>
      </div>

    </motion.div>

      </div>

      {/* Upload Existing Resume Dialog Overlay */}
      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        isImportingResume={isImportingResume}
        selectedResumeFile={selectedResumeFile}
        uploadError={uploadError}
        uploadSuccess={uploadSuccess}
        handleResumeFileChange={handleResumeFileChange}
        handleResumeImport={handleResumeImport}
      />

      {/* Dynamic Streaming AI Magic Optimizer Dialog Overlay */}
      <MagicOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        magicPromptType={magicPromptType}
        setMagicPromptType={setMagicPromptType}
        targetKeyword={targetKeyword}
        setTargetKeyword={setTargetKeyword}
        originalText={originalText}
        optimizedText={optimizedText}
        isOptimizing={isOptimizing}
        planStats={planStats}
        historyLogs={historyLogs}
        cancelOptimization={cancelOptimization}
        startStreamOptimization={startStreamOptimization}
        applySuggestion={applySuggestion}
        rollbackSuggestion={rollbackSuggestion}
      />

      {/* ATS Score Breakdown detailed report modal */}
      <ATSReportModal
        isOpen={showAtsReportModal}
        onClose={() => setShowAtsReportModal(false)}
        safeAtsMetadata={safeAtsMetadata}
        dynamicAtsData={dynamicAtsData}
        _atsBreakdown={_atsBreakdown}
        modalKeywordSearch={modalKeywordSearch}
        setModalKeywordSearch={setModalKeywordSearch}
        openMagicOptimizer={openMagicOptimizer}
      />

      <DeleteModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        onConfirm={() => {
          setAlertModalOpen(false);
        }}
        title={alertModalTitle}
        description={alertModalContent}
        confirmText="OK"
        confirmColorClass="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10"
        iconColorClass="text-indigo-500"
        iconBgClass="bg-indigo-50 dark:bg-indigo-950/50"
        hideCancel={true}
        IconComponent={Info}
      />

      {/* Auto Save Confirmation Modal */}
      <AnimatePresence>
        {showAutoSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAutoSaveModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <Save className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Turn Off Auto Save?
                  </h3>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Auto Save continuously saves your changes while you edit. If you turn it off, your edits will no longer be saved in real time.
                </p>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-6 border border-indigo-100 dark:border-indigo-800/30">
                  <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed">
                    <strong className="block mb-1 font-bold">Your work is protected.</strong>
                    Even with Auto Save turned off, CareerForge Pro automatically saves your latest changes when you leave the Resume Builder to help prevent accidental data loss.
                  </p>
                </div>

                <label className="flex items-center gap-2 mb-6 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={dontShowAutoSaveWarning}
                    onChange={(e) => setDontShowAutoSaveWarning(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                    Don't show this again
                  </span>
                </label>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowAutoSaveModal(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    Keep Auto Save On
                  </button>
                  <button
                    onClick={() => {
                      if (dontShowAutoSaveWarning) {
                        localStorage.setItem('cf_hide_autosave_warning', 'true');
                      }
                      setAutoSaveEnabled(false);
                      setShowAutoSaveModal(false);
                    }}
                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    Turn Off Auto Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Builder;

