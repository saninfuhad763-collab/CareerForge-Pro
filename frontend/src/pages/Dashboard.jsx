import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useResumeStore } from '../store/resumeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Trash2, 
  TrendingUp, 
  Layout, 
  LogOut, 
  Gauge, 
  Clock,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Compass,
  Download,
  CreditCard,
  Lock,
  Building,
  History,
  Eye,
  Loader2,
  Copy,
  Check,
  FileSignature,
} from 'lucide-react';
import { isPremiumTemplate, isProUser } from '../utils/planConstants';
import { staggerContainer, staggerItem, staggerItemScale } from '../animations/staggerAnimations';
import { premiumCardHover as _premiumCardHover, buttonScale, professionalCardVariant } from '../animations/cardAnimations';
import { sidebarItemVariant } from '../animations/dashboardAnimations';
import { premiumEase } from '../animations/motionVariants';
import DeleteModal from '../components/DeleteModal';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const { 
    resumes, 
    loadResumes, 
    createResume, 
    deleteResume,
    exportResumePdf,
    loading: storeLoading 
  } = useResumeStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resumes');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteCoverLetterConfirmId, setDeleteCoverLetterConfirmId] = useState(null);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  const [createError, setCreateError] = useState(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);

  const navigate = useNavigate();

  const [coverLetters, setCoverLetters] = useState([]);
  const [coverLettersLoading, setCoverLettersLoading] = useState(false);
  const [viewingCoverLetter, setViewingCoverLetter] = useState(null);
  const [exportingCoverLetterId, setExportingCoverLetterId] = useState(null);
  const [coverLetterExportError, setCoverLetterExportError] = useState('');
  const [modalCopied, setModalCopied] = useState(false);

  const loadCoverLetters = useCallback(async () => {
    setCoverLettersLoading(true);
    try {
      const token = localStorage.getItem('cf_token');
      const response = await fetch(`${API_URL}/cover-letters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCoverLetters(data.data);
      }
    } catch (err) {
      console.error('Failed to load cover letters', err);
    } finally {
      setCoverLettersLoading(false);
    }
  }, []);

  const handleDeleteCoverLetterClick = (id, e) => {
    if (e) e.stopPropagation();
    setDeleteCoverLetterConfirmId(id);
  };

  const executeDeleteCoverLetter = async (id) => {
    try {
      const token = localStorage.getItem('cf_token');
      const response = await fetch(`${API_URL}/cover-letters/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        loadCoverLetters();
      }
    } catch (err) {
      console.error('Failed to delete cover letter', err);
    }
  };

  const handleExportCoverLetterPdf = async (letter, e) => {
    if (e) e.stopPropagation();
    setExportingCoverLetterId(letter._id);
    setCoverLetterExportError('');
    try {
      const token = localStorage.getItem('cf_token');
      const response = await fetch(`${API_URL}/cover-letters/${letter._id}/export-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let message = 'Failed to export cover letter PDF.';
        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          message = `PDF export failed (HTTP ${response.status}).`;
        }
        throw new Error(message);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const safeCompany = (letter.companyName || 'cover-letter').replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-') || 'cover-letter';
      const safeTitle = (letter.jobTitle || 'letter').replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-') || 'letter';
      anchor.href = url;
      anchor.download = `${safeCompany}-${safeTitle}-cover-letter.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setCoverLetterExportError(err.message || 'Failed to export cover letter PDF.');
    } finally {
      setExportingCoverLetterId(null);
    }
  };

  // Dynamic theme mappings for the Craft New Resume dialog - all synchronized to the premium blue/indigo theme
  const templateThemes = {
    modern: {
      cardSelected: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
      inputSelected: 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 focus:border-indigo-500 focus:bg-indigo-50/30 dark:focus:bg-indigo-950/20 focus:ring-2 focus:ring-indigo-500/20',
      buttonSelected: 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 shadow-indigo-500/10'
    },
    classic: {
      cardSelected: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
      inputSelected: 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 focus:border-indigo-500 focus:bg-indigo-50/30 dark:focus:bg-indigo-950/20 focus:ring-2 focus:ring-indigo-500/20',
      buttonSelected: 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 shadow-indigo-500/10'
    },
    minimalist: {
      cardSelected: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
      inputSelected: 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 focus:border-indigo-500 focus:bg-indigo-50/30 dark:focus:bg-indigo-950/20 focus:ring-2 focus:ring-indigo-500/20',
      buttonSelected: 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 shadow-indigo-500/10'
    }
  };

  // Load user data on mount
  useEffect(() => {
    loadResumes();
    const timer = setTimeout(() => {
      loadCoverLetters();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadResumes, loadCoverLetters]);

  const openCreateModal = () => {
    setCreateError(null);
    setNewTitle('');
    setIsModalOpen(true);
  };

  const handleCreateResume = async (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    setActionLoading(true);
    setCreateError(null);
    const newResume = await createResume(newTitle.trim(), selectedTemplate);
    setActionLoading(false);
    
    if (newResume) {
      setIsModalOpen(false);
      setNewTitle('');
      // Navigate to full split-screen builder
      navigate(`/builder/${newResume._id}`);
    } else {
      const storeError = useResumeStore.getState().error;
      setCreateError(storeError || 'Failed to create resume. Free plan is limited to exactly 1 resume.');
    }
  };

  const isPro = isProUser(user);

  const handleUpgrade = () => {
    navigate('/billing');
  };

  const handleDownloadPdf = async (resume, e) => {
    e.stopPropagation();
    setDownloadLoadingId(resume._id);
    await exportResumePdf(resume._id, resume.title);
    setDownloadLoadingId(null);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    setDeleteConfirmId(id);
  };

  // Compute stats
  const totalResumes = resumes.length;
  const avgAtsScore = totalResumes > 0 
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.atsMetadata?.score || 0), 0) / totalResumes) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Dynamic Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col p-4 py-5 shrink-0 md:sticky md:top-0 md:h-screen">
        <div className="space-y-5 shrink-0">
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold font-display">
              CF
            </div>
            <span className="font-bold text-lg font-display text-slate-800 dark:text-slate-100">
              CareerForge Pro
            </span>
          </div>

          {/* User Bio Card */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-slate-400 truncate max-w-21.25">{user?.email}</p>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded leading-none shrink-0 uppercase tracking-wider ${
                  user?.plan === 'PRO' 
                    ? 'bg-amber-400 text-slate-900 shadow-sm' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {user?.plan || 'FREE'}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Links */}
          <nav className="space-y-0.5 text-left mt-6">
            <motion.button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-lg transition-colors cursor-pointer"
              whileHover="hover"
              variants={sidebarItemVariant}
            >
              <Compass className="w-4.5 h-4.5" />
              <span>Back to Home</span>
            </motion.button>
            <motion.button 
              onClick={() => setActiveTab('resumes')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'resumes'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
              whileHover="hover"
              variants={sidebarItemVariant}
            >
              <FileText className="w-4.5 h-4.5" />
              <span>Resumes</span>
            </motion.button>
             <motion.button 
              onClick={() => setActiveTab('ai-scoring')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'ai-scoring'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
              whileHover="hover"
              variants={sidebarItemVariant}
            >
              <Gauge className="w-4.5 h-4.5" />
              <span>AI Scoring</span>
            </motion.button>
            <motion.button 
              onClick={() => setActiveTab('cover-letters')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'cover-letters'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
              whileHover="hover"
              variants={sidebarItemVariant}
            >
              <FileSignature className="w-4.5 h-4.5" />
              <span>Cover Letters</span>
            </motion.button>
          </nav>
        </div>

        {/* Sidebar Footer Operations */}
        <div className="mt-auto pt-4 space-y-2 shrink-0">
          {user?.plan === 'PRO' || isPro ? (
            <motion.div 
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-xl bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white relative overflow-hidden shadow-sm shadow-indigo-500/20 text-left group"
            >
              <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none transition-transform group-hover:scale-150" />
              <div className="relative z-10">
                <div className="mb-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-400 text-slate-900 font-bold text-[8px] rounded uppercase tracking-wider shadow-sm">
                    <Sparkles className="w-2 h-2 fill-slate-900" /> PRO MEMBER
                  </span>
                </div>
                <h4 className="font-bold text-xs mb-1">Pro Plan Active</h4>
                <div className="text-[10px] text-indigo-100 mb-2.5 leading-tight space-y-0.5">
                  <p>Unlimited resumes</p>
                  <p>Unlimited AI rewrites</p>
                  <p>Premium templates unlocked</p>
                </div>
                <button
                  onClick={() => navigate('/billing')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white transition-colors py-1.5 rounded-lg text-[11px] font-bold shadow-sm shadow-indigo-950/10 cursor-pointer"
                >
                  View Plan
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-xl bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white relative overflow-hidden shadow-sm shadow-indigo-500/20 text-left group"
            >
              <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none transition-transform group-hover:scale-150" />
              <div className="relative z-10">
                <div className="mb-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-400 text-slate-900 font-bold text-[8px] rounded uppercase tracking-wider shadow-sm">
                    <Sparkles className="w-2 h-2 fill-slate-900" /> PREMIUM
                  </span>
                </div>
                <h4 className="font-bold text-xs mb-1">Upgrade to Pro Plan</h4>
                <p className="text-[10px] text-indigo-100 mb-2.5 leading-tight">
                  Unlock unlimited resume generation, keyword analytics, and premium templates!
                </p>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-white hover:bg-slate-50 text-indigo-600 transition-colors py-1.5 rounded-lg text-[11px] font-bold shadow-md shadow-indigo-950/20 cursor-pointer"
                >
                  Upgrade to Pro
                </button>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => navigate('/billing/details')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <CreditCard className="w-4.5 h-4.5" />
            <span>Billing</span>
          </button>

          <button
            onClick={() => {
              setShowSignoutConfirm(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'resumes' && (
            <motion.div
              key="resumes"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.02
                  }
                },
                exit: {
                  opacity: 0,
                  y: -15,
                  transition: { duration: 0.3 }
                }
              }}
              className="space-y-8"
            >
              {/* Welcome Dashboard Banner Header */}
              <motion.div 
                variants={staggerItem}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="text-left space-y-1">
                  <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Build, optimize, and scan your resumes to trigger interview call backs.
                  </p>
                </div>
                {totalResumes > 0 && (
                  <motion.button
                    onClick={openCreateModal}
                    variants={buttonScale}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer self-start sm:self-center"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    <span>Create Resume</span>
                  </motion.button>
                )}
              </motion.div>

              {/* Modular Analytics Cards */}
              <motion.section 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={staggerContainer(0.04)}
              >
                {/* Card 1 */}
                <motion.div 
                  variants={staggerItemScale}
                  whileHover="hover"
                  className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Resumes</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">{totalResumes}</h3>
                  </div>
                </motion.div>

                {/* Card 2 */}
                <motion.div 
                  variants={staggerItemScale}
                  whileHover="hover"
                  className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Gauge className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg ATS Score</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5 font-sans">
                      {avgAtsScore}%
                    </h3>
                  </div>
                </motion.div>

                {/* Card 3 */}
                <motion.div 
                  variants={staggerItemScale}
                  whileHover="hover"
                  className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Roles</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">Locked</h3>
                  </div>
                </motion.div>

                {/* Card 4 */}
                <motion.div 
                  variants={staggerItemScale}
                  whileHover="hover"
                  onClick={() => navigate('/cover-letter')}
                  className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                    <History className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cover Letters</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">
                      {coverLetters.length}
                    </h3>
                  </div>
                </motion.div>
              </motion.section>

              {/* Resumes Dashboard Listing */}
              <motion.section variants={staggerItem} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
                    Your Saved Resumes
                  </h2>
                </div>

                {storeLoading ? (
                   <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                     <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                     <p className="text-sm font-semibold">Fetching your profiles...</p>
                   </div>
                ) : resumes.length === 0 ? (
                  /* Styled Empty State */
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                      <Compass className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">No resumes crafted yet</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Create your first professional ATS-proof resume in seconds using our real-time split-screen builder.
                      </p>
                    </div>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Resume</span>
                    </button>
                  </motion.div>
                ) : (
                  /* Grid layout for resumes */
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer(0.05)}
                  >
                    {resumes.map((resume) => {
                      const score = resume.atsMetadata?.score || 0;
                      const initialScore = resume.atsMetadata?.initialScore !== undefined ? resume.atsMetadata.initialScore : score;
                      const optimizedScore = resume.atsMetadata?.optimizedScore || 0;
                      const scoreImprovement = resume.atsMetadata?.scoreImprovement || 0;
                      const lastJdHash = resume.atsMetadata?.lastJdHash || '';
                      const hasOptimization = lastJdHash && optimizedScore > 0;

                      let scoreColor = 'bg-red-500 text-white';
                      if (score >= 75) scoreColor = 'bg-emerald-500 text-white';
                      else if (score >= 55) scoreColor = 'bg-amber-500 text-white';

                      return (
                        <motion.div
                          key={resume._id}
                          onClick={() => navigate(`/builder/${resume._id}`)}
                          variants={professionalCardVariant}
                          whileHover="hover"
                          whileTap="tap"
                          className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-left flex flex-col justify-between h-48 cursor-pointer relative shadow-sm hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:shadow-lg transition-all duration-300"
                        >
                          {/* Header */}
                          <div className="space-y-2 z-10">
                            <div className="flex justify-between items-start gap-4">
                              <h3 className="font-bold font-display text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 truncate">
                                {resume.title}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${scoreColor}`}>
                                ATS: {score}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Layout className="w-3.5 h-3.5" />
                              <span className="capitalize">{resume.templateId} Template</span>
                            </div>
                            {hasOptimization && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-slate-400 font-semibold">Before: {initialScore}%</span>
                                <span className="text-[10px] text-slate-300 dark:text-slate-700">|</span>
                                <span className="text-[10px] text-slate-400 font-semibold">After: {optimizedScore}%</span>
                                <span className={`text-[9px] font-bold ml-1 px-1 py-0.2 rounded ${
                                  scoreImprovement > 0 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                    : scoreImprovement < 0 
                                      ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                                      : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                                }`}>
                                  {scoreImprovement > 0 ? `+${scoreImprovement}%` : `${scoreImprovement}%`}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 z-10">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleDownloadPdf(resume, e)}
                                disabled={downloadLoadingId === resume._id}
                                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 opacity-30 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 cursor-pointer disabled:opacity-50"
                                title="Download PDF"
                              >
                                <Download className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(resume._id, e)}
                                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 opacity-30 group-hover:opacity-100 focus:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 cursor-pointer"
                                title="Delete Resume"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                              <span className="p-2 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/20 -translate-x-0.5 group-hover:translate-x-0 transition-all duration-300">
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.section>
            </motion.div>
          )}

          {activeTab === 'cover-letters' && (
            <motion.div
              key="cover-letters"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.02
                  }
                },
                exit: {
                  opacity: 0,
                  y: -15,
                  transition: { duration: 0.3 }
                }
              }}
              className="space-y-8 text-left"
            >
              {/* Header */}
              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <History className="w-8 h-8 text-violet-500" />
                    <span>Saved Cover Letters</span>
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage and view your generated cover letters history.
                  </p>
                </div>
                {coverLetters.length > 0 && (
                  <motion.button
                    onClick={() => navigate('/cover-letter')}
                    variants={buttonScale}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer self-start sm:self-center"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    <span>Generate Cover Letter</span>
                  </motion.button>
                )}
              </motion.div>

              {coverLetterExportError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-center justify-between gap-2 text-amber-700 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-semibold">{coverLetterExportError}</p>
                  </div>
                  <button
                    onClick={() => setCoverLetterExportError('')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800 cursor-pointer shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {coverLettersLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                  <p className="text-sm font-semibold">Loading cover letters...</p>
                </div>
              ) : coverLetters.length === 0 ? (
                <div className="py-12 md:py-24 flex items-center justify-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                      <History className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">No cover letters saved yet</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Generate a professional, AI-tailored cover letter and save it to your history.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/cover-letter')}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Generate Cover Letter</span>
                    </button>
                  </motion.div>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer(0.05)}
                >
                  {coverLetters.map((letter) => {
                    const linkedResume = resumes.find(r => r._id === letter.resumeId);
                    return (
                      <motion.div
                        key={letter._id}
                        variants={professionalCardVariant}
                        whileHover="hover"
                        whileTap="tap"
                        className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-left flex flex-col justify-between h-56 cursor-pointer relative shadow-sm hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:shadow-lg transition-all duration-300"
                        onClick={() => setViewingCoverLetter(letter)}
                      >
                        <div className="space-y-2 z-10">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-bold font-display text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 truncate">
                              {letter.jobTitle}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                            <Building className="w-3.5 h-3.5" />
                            <span className="truncate">{letter.companyName}</span>
                          </div>
                          {linkedResume && (
                            <p className="text-[10px] text-slate-400 font-medium truncate">
                              Linked to: <span className="underline">{linkedResume.title}</span>
                            </p>
                          )}
                          <p className="text-xs text-slate-400 line-clamp-3 mt-2">
                            {letter.coverLetter}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 z-10 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(letter.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingCoverLetter(letter);
                              }}
                              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 opacity-30 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 cursor-pointer"
                              title="View Cover Letter"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={(e) => handleExportCoverLetterPdf(letter, e)}
                              disabled={exportingCoverLetterId === letter._id}
                              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 opacity-30 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Export PDF"
                            >
                              {exportingCoverLetterId === letter._id ? (
                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              ) : (
                                <Download className="w-4.5 h-4.5" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCoverLetterClick(letter._id, e);
                              }}
                              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 opacity-30 group-hover:opacity-100 focus:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 cursor-pointer"
                              title="Delete Cover Letter"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'ai-scoring' && (
            <motion.div
              key="ai-scoring"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.02
                  }
                },
                exit: {
                  opacity: 0,
                  y: -15,
                  transition: { duration: 0.3 }
                }
              }}
              className="space-y-8 text-left"
            >
              {/* Header */}
              <motion.div variants={staggerItem} className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <Gauge className="w-8 h-8 text-indigo-500" />
                  <span>AI Scoring & ATS Analytics Center</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Track your active resume portfolios, review target keyword matches, and raise candidate rating metrics.
                </p>
              </motion.div>

              {/* Quick Metrics */}
              <motion.section 
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={staggerContainer(0.08)}
              >
                <motion.div 
                  variants={staggerItemScale} 
                  whileHover="hover"
                  className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Gauge className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Match Rating</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">{avgAtsScore}%</h3>
                  </div>
                </motion.div>

                <motion.div 
                  variants={staggerItemScale} 
                  whileHover="hover"
                  className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Credits</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">10 / 10 Free</h3>
                  </div>
                </motion.div>

                <motion.div 
                  variants={staggerItemScale} 
                  whileHover="hover"
                  className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highly Optimized Resumes</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">
                      {resumes.filter(r => (r.atsMetadata?.score || 0) >= 70).length} Profile(s)
                    </h3>
                  </div>
                </motion.div>
              </motion.section>

              {/* Resume Analytics List */}
              <motion.div 
                variants={staggerItem}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 space-y-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-500 shadow-sm"
              >
                <h2 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
                  Active Match Standings
                </h2>

                {resumes.length === 0 ? (
                  <p className="text-sm text-slate-400">Create a resume first to run automated ATS matching analysis.</p>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    variants={staggerContainer(0.05)}
                  >
                    {resumes.map((resume) => {
                      const score = resume.atsMetadata?.score || 0;
                      const initialScore = resume.atsMetadata?.initialScore !== undefined ? resume.atsMetadata.initialScore : score;
                      const optimizedScore = resume.atsMetadata?.optimizedScore || 0;
                      const scoreImprovement = resume.atsMetadata?.scoreImprovement || 0;
                      const lastJdHash = resume.atsMetadata?.lastJdHash || '';
                      const hasOptimization = lastJdHash && optimizedScore > 0;
                      const status = hasOptimization ? 'Optimized' : 'Initial Analysis';

                      let barColor = 'bg-red-500';
                      let textColor = 'text-red-500';
                      if (score >= 75) {
                        barColor = 'bg-emerald-500';
                        textColor = 'text-emerald-500';
                      } else if (score >= 55) {
                        barColor = 'bg-amber-500';
                        textColor = 'text-amber-500';
                      }

                      return (
                        <motion.div 
                          key={resume._id} 
                          onClick={() => navigate(`/builder/${resume._id}?mode=optimize`)}
                          variants={professionalCardVariant}
                          whileHover="hover"
                          whileTap="tap"
                          className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{resume.title}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-slate-400">Last updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                                <span className="text-[10px] text-slate-300 dark:text-slate-700">|</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none ${
                                  hasOptimization
                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800/85 text-slate-500'
                                }`}>
                                  {status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 self-end md:self-center">
                            {hasOptimization ? (
                              <div className="text-right space-y-1">
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Before: {initialScore}%</span>
                                  <span className="text-xs font-semibold text-slate-300 dark:text-slate-700">|</span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">After: {optimizedScore}%</span>
                                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                    scoreImprovement > 0 
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                      : scoreImprovement < 0 
                                        ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                                        : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {scoreImprovement > 0 ? `+${scoreImprovement}%` : `${scoreImprovement}%`}
                                  </span>
                                </div>
                                <div className="w-32 ml-auto bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <motion.div 
                                    className={`h-full ${barColor}`} 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 0.8, ease: premiumEase }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-right space-y-1">
                                <span className={`text-xs font-bold ${textColor}`}>Current ATS Match: {score}%</span>
                                <div className="w-32 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <motion.div 
                                    className={`h-full ${barColor}`} 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 0.8, ease: premiumEase }}
                                  />
                                </div>
                              </div>
                            )}
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                              Optimize <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>

              {/* Instruction Widget */}
              <div className="p-6 bg-linear-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-500 shrink-0 shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">How to use AI ATS Scoring</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                    AI ATS Scoring is seamlessly integrated directly into the **Split-Screen Resume Builder**. Select any resume above, paste your target Job Description on the left, and watch your score calculate in real-time as you add missing keywords!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dynamic Creation Dialog Overlay (Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Box */}
            <motion.div
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative z-10 space-y-6"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: premiumEase }}
            >
              <div className="text-left space-y-1">
                <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> Craft New ATS Resume
                </h3>
                <p className="text-sm text-slate-400">Specify details to build your optimized CV.</p>
              </div>

              <form onSubmit={handleCreateResume} className="space-y-5 text-left">
                {/* Custom Upgrade Alert if Free Plan Limit Reached */}
                {createError && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/40 rounded-2xl flex flex-col gap-3">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-normal">
                        {createError}
                      </p>
                    </div>
                    
                    {/* Upgrade CTA — shown when free resume limit is hit */}
                    {createError.includes('Free tier is limited') && (
                      <button
                        type="button"
                        onClick={handleUpgrade}
                        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Upgrade to Pro &rarr;</span>
                      </button>
                    )}

                    {/* Billing page redirect — shown when a locked premium template is clicked */}
                    {createError.includes('Pro-only') && (
                      <button
                        type="button"
                        onClick={() => navigate('/billing')}
                        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>View Pro Plans &rarr;</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider transition-colors duration-300 text-indigo-500">Resume Title</label>
                  <input
                     type="text"
                     required
                     placeholder="e.g. Software Engineer Resume"
                     value={newTitle}
                     onChange={(e) => setNewTitle(e.target.value)}
                     className={`w-full px-4 py-3 border rounded-xl text-sm text-slate-800 dark:text-slate-100 transition-all outline-none ${
                       templateThemes[selectedTemplate]?.inputSelected || 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500'
                     }`}
                  />
                </div>

                {/* Templates Selector Grid */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Template</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'modern', name: 'Modern', desc: 'Elegant typography' },
                      { id: 'classic', name: 'Classic', desc: 'Standard layout' },
                      { id: 'minimalist', name: 'Minimal', desc: 'Ultra clean space' },
                    ].map((tpl) => {
                      const locked = isPremiumTemplate(tpl.id) && !isPro;
                      return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          if (locked) {
                            setCreateError('Classic and Minimalist templates are Pro-only. Upgrade to unlock premium templates.');
                            return;
                          }
                          setSelectedTemplate(tpl.id);
                        }}
                        className={`p-3 text-left border rounded-xl flex flex-col justify-between transition-all ${
                          locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          selectedTemplate === tpl.id
                            ? templateThemes[tpl.id]?.cardSelected || 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-950/50'
                        }`}
                      >
                        <span className={`text-xs font-bold transition-colors flex items-center gap-1 ${
                          selectedTemplate === tpl.id 
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {tpl.name}
                          {locked && <Lock className="w-3 h-3 text-amber-500" />}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate mt-1 leading-none">
                          {locked ? 'Pro only' : tpl.desc}
                        </span>
                      </button>
                    );})}
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !newTitle.trim()}
                    className={`text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md ${
                      templateThemes[selectedTemplate]?.buttonSelected || 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 shadow-indigo-500/10'
                    }`}
                  >
                    {actionLoading ? 'Initializing...' : 'Forge Resume'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Resume Modal */}
      <DeleteModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={async () => {
          await deleteResume(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        title="Delete Resume?"
        description="Are you sure you want to delete this resume? This action is permanent and cannot be undone."
      />

      {/* Delete Cover Letter Modal */}
      <DeleteModal
        isOpen={!!deleteCoverLetterConfirmId}
        onClose={() => setDeleteCoverLetterConfirmId(null)}
        onConfirm={async () => {
          await executeDeleteCoverLetter(deleteCoverLetterConfirmId);
          setDeleteCoverLetterConfirmId(null);
        }}
        title="Delete Cover Letter?"
        description="Are you sure you want to delete this cover letter? This action is permanent and cannot be undone."
      />

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignoutConfirm(false)}
            />

            {/* Modal Box */}
            <motion.div
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative z-10 space-y-5"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: premiumEase }}
            >
              <div className="flex items-center gap-3 text-indigo-500">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100 text-left">Sign Out</h3>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal text-left">
                Are you sure you want to sign out of your CareerForge Pro account?
              </p>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignoutConfirm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Cover Letter Modal */}
      <AnimatePresence>
        {viewingCoverLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingCoverLetter(null)}
            />

            {/* Modal Box */}
            <motion.div
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 space-y-6 flex flex-col max-h-[85vh]"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: premiumEase }}
            >
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <div className="text-left">
                  <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">
                    {viewingCoverLetter.jobTitle}
                  </h3>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                    {viewingCoverLetter.companyName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(viewingCoverLetter.coverLetter);
                      setModalCopied(true);
                      setTimeout(() => setModalCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {modalCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Content</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleExportCoverLetterPdf(viewingCoverLetter)}
                    disabled={exportingCoverLetterId === viewingCoverLetter._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {exportingCoverLetterId === viewingCoverLetter._id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Export PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 bg-slate-50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-850 rounded-2xl p-5">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed text-left">
                  {viewingCoverLetter.coverLetter}
                </pre>
              </div>

              {coverLetterExportError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-semibold">{coverLetterExportError}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewingCoverLetter(null);
                    setCoverLetterExportError('');
                    setModalCopied(false);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
