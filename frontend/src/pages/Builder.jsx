import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';

const Builder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentResume, 
    loadResumeById, 
    updateResumeLocal, 
    saveResumeImmediately, 
    saving, 
    loading, 
    error 
  } = useResumeStore();

  const [activeAccordion, setActiveAccordion] = useState('personal');
  const [saveStatus, setSaveStatus] = useState('Saved to cloud');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // State abstractions for JD ATS Check & AI Optimization
  const [jdText, setJdText] = useState('');
  const [isJdAnalyzing, setIsJdAnalyzing] = useState(false);
  const [atsBreakdown, setAtsBreakdown] = useState(null);
  const [isJdOpen, setIsJdOpen] = useState(false);

  // Magic Optimizer State
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [optimizerType, setOptimizerType] = useState('summary'); // 'summary' | 'bullet'
  const [originalText, setOriginalText] = useState('');
  const [optimizedText, setOptimizedText] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [magicPromptType, setMagicPromptType] = useState('summary_rewrite');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentLogId, setCurrentLogId] = useState(null);
  const [onApplyCallback, setOnApplyCallback] = useState(null);
  const [activeAbortController, setActiveAbortController] = useState(null);

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

  const handleJdAnalysis = async () => {
    if (!jdText.trim()) return;
    setIsJdAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/ai/analyze-jd`, {
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
      const data = await response.json();
      if (data.success) {
        setAtsBreakdown(data.breakdown);
        // Refresh local resume payload in store to display new scores immediately
        await loadResumeById(id);
      }
    } catch (e) {
      console.error('Failed to analyze JD:', e);
    } finally {
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

  const startStreamOptimization = async () => {
    setIsOptimizing(true);
    setOptimizedText('');
    setCurrentLogId(null);

    const controller = new AbortController();
    setActiveAbortController(controller);

    try {
      const params = new URLSearchParams({
        resumeId: id,
        promptType: magicPromptType,
        originalText,
        contextKeyword: targetKeyword
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
  }, [id, loadResumeById]);

  // Sync visual saving feedback
  useEffect(() => {
    if (saving) {
      setSaveStatus('Saving changes...');
    } else {
      setSaveStatus('All changes saved');
    }
  }, [saving]);

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

  // Destructure resume sections with fallbacks
  const {
    title = '',
    templateId = 'modern',
    sectionOrder = [],
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    certifications = [],
    projects = [],
    languages = [],
    atsMetadata = { score: 50, feedback: [] }
  } = currentResume;

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
  };

  const handleUpdateSkillCategory = (index, field, value) => {
    const updated = [...skills];
    if (field === 'keywords') {
      // Split comma separated list into string array
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
      setSaveStatus('All changes saved');
    } else {
      setSaveStatus('Save error. Try again.');
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
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            onClick={saveResumeImmediately}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-left">
            <input
              type="text"
              value={title}
              onChange={(e) => updateResumeLocal({ title: e.target.value })}
              className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 font-bold font-display text-slate-800 dark:text-slate-100 text-lg focus:outline-none px-1 py-0.5 rounded transition-all"
            />
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span>Status:</span>
              <span className={`font-semibold ${saving ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-500'}`}>
                {saveStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          {/* Template Select Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Theme:</span>
            <select
              value={templateId}
              onChange={(e) => updateResumeLocal({ templateId: e.target.value })}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="modern">Modern (Accent)</option>
              <option value="classic">Classic (Traditional)</option>
              <option value="minimalist">Minimalist (Clean)</option>
            </select>
          </div>

          <button
            onClick={handleForceSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Now</span>
          </button>
        </div>
      </header>

      {/* Editor Split-Screen Layout Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT WORKSPACE: Input Accordion Editor Panel */}
        <motion.div 
          variants={slideUp}
          className="w-full md:w-[48%] lg:w-[45%] border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto p-5 space-y-6 bg-slate-50 dark:bg-slate-950/20 text-left"
        >
          
          {/* Dedicated JD Analysis & Circular ATS Score Panel */}
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
                {isJdOpen ? 'Hide Input' : 'Paste JD'}
              </button>
            </div>

            {/* Pasting JD Accordion Section */}
            {isJdOpen && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Job Description</label>
                  <textarea
                    rows={4}
                    placeholder="Paste the target job description text here to calculate your precise match score and identify critical keyword gaps..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={isJdAnalyzing || !jdText.trim()}
                  onClick={handleJdAnalysis}
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isJdAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Running ATS Matcher...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-3.5 h-3.5" />
                      <span>Run ATS Matcher</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Score & Breakdown display */}
            <div className="flex items-center gap-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {/* Circular ATS score progress */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className={`${
                      atsMetadata.score >= 80
                        ? 'stroke-emerald-500'
                        : atsMetadata.score >= 60
                        ? 'stroke-amber-500'
                        : 'stroke-red-500'
                    } transition-all duration-500`}
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - atsMetadata.score / 100)}
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  {atsMetadata.score}%
                </span>
              </div>

              <div className="space-y-1 text-left min-w-0">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {atsMetadata.score >= 80 ? 'Excellent Match!' : atsMetadata.score >= 60 ? 'Good Potential' : 'Needs Optimization'}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed truncate">
                  {atsMetadata.feedback && atsMetadata.feedback.length > 0
                    ? atsMetadata.feedback[0]
                    : 'Analyze a JD above to generate custom advice.'}
                </p>
                <div className="text-[9px] text-slate-400 font-medium">
                  AI rewrite credit usage: <span className="font-bold text-slate-600 dark:text-slate-300">{planStats.aiRewriteCount} / {planStats.aiLimit === Infinity ? 'Unlimited' : planStats.aiLimit} limit</span>
                </div>
              </div>
            </div>

            {/* Keyword gaps list (Extracted from atsBreakdown) */}
            {atsBreakdown && (
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ATS Keyword Alignment</h6>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {atsBreakdown.missingKeywords.slice(0, 8).map((kw) => (
                    <span
                      key={kw}
                      onClick={() => openMagicOptimizer('bullet', '', (newVal) => {
                        // Quick inject placeholder helper
                        alert(`Copy optimized text and inject into your work details:\n\n${newVal}`);
                      })}
                      className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400 rounded-md text-[9px] font-bold border border-amber-200/50 dark:border-amber-900/50 cursor-pointer hover:border-amber-400 transition-colors"
                      title="Click to open Magic Optimizer for this keyword"
                    >
                      + {kw}
                    </span>
                  ))}
                  {atsBreakdown.missingKeywords.length === 0 && (
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> All required keywords integrated successfully!
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

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
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-500/25 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
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
                                className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md shadow-sm shadow-indigo-500/25 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
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
                              value={skill.keywords ? skill.keywords.join(', ') : ''}
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
          className="flex-1 bg-slate-200/50 dark:bg-slate-900/30 overflow-y-auto p-6 md:p-8 flex justify-center"
        >
          
          {/* Main Visual Render Page sheet standard */}
          <div className="w-full max-w-[800px] min-h-[1056px] bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-xl border border-slate-300/40 dark:border-slate-800/80 rounded-lg p-8 md:p-12 flex flex-col justify-between text-left relative overflow-hidden transition-all duration-300">
            
            {/* Header branding overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500" />
            
            <div>
              {/* Dynamic Header Section (Personal details) based on templateId */}
              <header className={`pb-6 border-b ${
                templateId === 'classic' ? 'text-center border-slate-300' : 'flex flex-col sm:flex-row justify-between sm:items-end border-slate-200/50 dark:border-slate-800'
              }`}>
                <div>
                  <h1 className={`font-display font-extrabold tracking-tight text-slate-900 dark:text-slate-100 ${
                    templateId === 'classic' ? 'text-3xl' : 'text-2xl sm:text-3xl'
                  }`}>
                    {personalInfo.fullName || 'YOUR FULL NAME'}
                  </h1>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wide">
                    {experience[0]?.position || 'Target Professional Role'}
                  </p>
                </div>
                
                <div className={`text-xs text-slate-500 dark:text-slate-400 space-y-1 ${
                  templateId === 'classic' ? 'flex flex-wrap items-center justify-center gap-x-4 mt-3 border-t pt-2 border-slate-100 dark:border-slate-900' : 'mt-4 sm:mt-0 sm:text-right'
                }`}>
                  <p>{personalInfo.email || 'email@address.com'}</p>
                  <p>{personalInfo.phone || '+1 (555) 000-0000'}</p>
                  <p>{personalInfo.location || 'Location Area, State'}</p>
                  <div className={`flex gap-3 justify-start sm:justify-end ${templateId === 'classic' ? 'w-full justify-center' : ''}`}>
                    {personalInfo.website && <span className="hover:underline text-[10px]">{personalInfo.website}</span>}
                    {personalInfo.github && <span className="hover:underline text-[10px]">{personalInfo.github}</span>}
                    {personalInfo.linkedin && <span className="hover:underline text-[10px]">{personalInfo.linkedin}</span>}
                  </div>
                </div>
              </header>

              {/* Dynamic Render Loop of active sections based on sectionOrder */}
              <div className="pt-6 space-y-6">
                {sectionOrder.map((sectionName) => {
                  
                  // Summary Section
                  if (sectionName === 'summary' && summary) {
                    return (
                      <section key="summary" className="space-y-2">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Professional Summary
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                          {summary}
                        </p>
                      </section>
                    );
                  }

                  // Work Experience Section
                  if (sectionName === 'experience' && experience.length > 0) {
                    return (
                      <section key="experience" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Professional Experience
                        </h2>
                        <div className="space-y-4">
                          {experience.map((exp, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{exp.position || 'Position Title'}</span>
                                  <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span>
                                  <span className="font-semibold text-slate-600 dark:text-slate-400">{exp.company || 'Company'}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {exp.startDate || 'Date'} — {exp.current ? 'Present' : exp.endDate || 'Date'}
                                </span>
                              </div>
                              {exp.location && <p className="text-[10px] text-slate-400">{exp.location}</p>}
                              {exp.description && (
                                <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 font-sans">
                                  {exp.description.split('\n').map((bullet, bIdx) => (
                                    <li key={bIdx}>{bullet.replace(/^- /, '')}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Education Section
                  if (sectionName === 'education' && education.length > 0) {
                    return (
                      <section key="education" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Education
                        </h2>
                        <div className="space-y-3">
                          {education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-start text-xs">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{edu.degree || 'Degree Major'}</span>
                                <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span>
                                <span className="font-semibold text-slate-600 dark:text-slate-400">{edu.school || 'School'}</span>
                                {edu.location && <span className="text-[10px] text-slate-400 ml-2">({edu.location})</span>}
                              </div>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {edu.startDate || 'Date'} — {edu.endDate || 'Date'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Technical Skills Section
                  if (sectionName === 'skills' && skills.length > 0) {
                    return (
                      <section key="skills" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Skills
                        </h2>
                        <div className="space-y-2 text-xs">
                          {skills.map((skill, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1.5">
                              <span className="sm:col-span-3 font-bold text-slate-700 dark:text-slate-300 capitalize">{skill.name || 'Group'}:</span>
                              <div className="sm:col-span-9 flex flex-wrap gap-x-1.5 gap-y-1">
                                {skill.keywords && skill.keywords.map((kw, kwIdx) => (
                                  <span key={kwIdx} className="text-slate-600 dark:text-slate-400">
                                    {kw}{kwIdx < skill.keywords.length - 1 ? ',' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Projects Section
                  if (sectionName === 'projects' && projects.length > 0) {
                    return (
                      <section key="projects" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Projects
                        </h2>
                        <div className="space-y-3">
                          {projects.map((proj, idx) => (
                            <div key={idx} className="space-y-1 text-xs">
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
                              {proj.description && <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{proj.description}</p>}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Certifications Section
                  if (sectionName === 'certifications' && certifications.length > 0) {
                    return (
                      <section key="certifications" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Certifications
                        </h2>
                        <div className="space-y-2 text-xs">
                          {certifications.map((cert, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{cert.name || 'Certification Name'}</span>
                                <span className="text-slate-400 mx-1.5">—</span>
                                <span className="text-slate-600 dark:text-slate-400">{cert.issuer}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{cert.date}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Languages Section
                  if (sectionName === 'languages' && languages.length > 0) {
                    return (
                      <section key="languages" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Languages
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                          {languages.map((lang, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{lang.language}</span>
                              {lang.proficiency && <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 border px-1.5 py-0.5 rounded">({lang.proficiency})</span>}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  return null;
                })}
              </div>
            </div>

            {/* Resume Page Footer info */}
            <footer className="pt-8 border-t border-slate-100 dark:border-slate-900/80 text-[9px] text-slate-300 text-center uppercase tracking-widest font-mono">
              Generated by CareerForge Pro ATS Builder
            </footer>
          </div>

        </motion.div>

      </div>

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
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Optimizations</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!optimizedText || isOptimizing}
                      onClick={applySuggestion}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
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
    </motion.div>
  );
};

export default Builder;
