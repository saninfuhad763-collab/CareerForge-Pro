import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useResumeStore } from '../store/resumeStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Briefcase,
  Building,
  AlertCircle,
  ArrowLeft,
  LogOut,
  Compass,
  CreditCard,
  Save,
  Loader2,
  Trash2,
  History,
  Eye,
  Download,
  FileSignature,
  Gauge,
} from 'lucide-react';
import { isProUser } from '../utils/planConstants';

import { sidebarItemVariant } from '../animations/dashboardAnimations';
import { premiumEase } from '../animations/motionVariants';
import { staggerContainer, staggerItem } from '../animations/staggerAnimations';
import { buttonScale, professionalCardVariant } from '../animations/cardAnimations';
import DeleteModal from '../components/DeleteModal';

const API_URL = import.meta.env.VITE_API_URL || '/api';



const CoverLetter = () => {
  const { user, logout } = useAuthStore();
  const { resumes, loadResumes, loading: resumesLoading } = useResumeStore();
  const navigate = useNavigate();
  const activeTab = 'cover-letters';

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [savedCoverLetters, setSavedCoverLetters] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exportCoverLetterId, setExportCoverLetterId] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  const fetchSavedCoverLetters = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const token = localStorage.getItem('cf_token');
      const response = await fetch(`${API_URL}/cover-letters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSavedCoverLetters(data.data);
      }
    } catch (_err) {
      console.error('Failed to load saved cover letters', _err);
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  const handleSave = async () => {
    if (!coverLetter) return;
    setSaving(true);
    setSaveSuccess(false);
    setError('');
    try {
      const token = localStorage.getItem('cf_token');
      const response = await fetch(`${API_URL}/cover-letters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          coverLetter: coverLetter,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSaveSuccess(true);
        setExportCoverLetterId(data.data._id);
        setTimeout(() => setSaveSuccess(false), 2000);
        fetchSavedCoverLetters();
      } else {
        setError(data.message || 'Failed to save cover letter.');
      }
    } catch (_err) {
      setError('Network error: Failed to save cover letter.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSavedClick = (id, e) => {
    if (e) e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const executeDelete = async (id) => {
    setError('');
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
        fetchSavedCoverLetters();
      } else {
        setError(data.message || 'Failed to delete cover letter.');
      }
    } catch (_err) {
      setError('Network error: Failed to delete cover letter.');
    }
  };

  const handleViewSaved = (cl) => {
    setCoverLetter(cl.coverLetter);
    setCompanyName(cl.companyName);
    setJobTitle(cl.jobTitle);
    setExportCoverLetterId(cl._id);
    setExportError('');
    if (cl.resumeId) {
      const rId = typeof cl.resumeId === 'object' ? cl.resumeId._id : cl.resumeId;
      setSelectedResumeId(rId);
    }
  };

  useEffect(() => {
    loadResumes();
    const timer = setTimeout(() => {
      fetchSavedCoverLetters();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadResumes, fetchSavedCoverLetters]);

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const timer = setTimeout(() => {
        setSelectedResumeId(resumes[0]._id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [resumes, selectedResumeId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select a resume profile.');
      return;
    }
    if (!companyName.trim()) {
      setError('Please enter a target company name.');
      return;
    }
    if (!jobTitle.trim()) {
      setError('Please enter a target job title.');
      return;
    }

    setGenerating(true);
    setError('');
    setExportError('');
    setCoverLetter('');
    setExportCoverLetterId('');

    try {
      const token = localStorage.getItem('cf_token');
      const response = await fetch(`${API_URL}/ai/generate-cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCoverLetter(data.coverLetter);
      } else {
        setError(data.message || 'Failed to generate cover letter.');
      }
    } catch (_err) {
      setError('Network error: Failed to connect to server.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    if (!exportCoverLetterId) {
      setExportError('Save this cover letter to history before exporting PDF.');
      return;
    }

    setExportingPdf(true);
    setExportError('');

    try {
      const token = localStorage.getItem('cf_token');
      const response = await fetch(`${API_URL}/cover-letters/${exportCoverLetterId}/export-pdf`, {
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
      const safeCompany = (companyName || 'cover-letter').replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-') || 'cover-letter';
      const safeTitle = (jobTitle || 'letter').replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-') || 'letter';
      anchor.href = url;
      anchor.download = `${safeCompany}-${safeTitle}-cover-letter.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (err) {
      setExportError(err.message || 'Failed to export cover letter PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/billing');
  };

  const isPro = isProUser(user);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col p-4 py-5 shrink-0 md:sticky md:top-0 md:h-screen z-20">
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
              onClick={() => navigate('/dashboard?tab=resumes')}
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
              onClick={() => navigate('/dashboard?tab=ai-scoring')}
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
              onClick={() => navigate('/dashboard?tab=cover-letters')}
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
      <motion.main 
        key="cover-letter-generator"
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
        className="flex-1 px-4 py-5 md:px-8 md:py-6 overflow-y-auto max-h-screen text-left flex flex-col min-h-0"
      >
        {/* Navigation Button */}
        <motion.div variants={staggerItem} className="mb-4 md:mb-5 shrink-0">
          <button
            onClick={() => navigate('/dashboard?tab=cover-letters')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md transition-all shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cover Letter History</span>
          </button>
        </motion.div>

        {/* Banner Header */}
        <motion.div variants={staggerItem} className="space-y-1.5 shrink-0 mb-6 md:mb-8">
          <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>AI Cover Letter Generator</span>
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-2xl">
            Generate custom professional cover letters that highlight your strengths aligned with the target job.
          </p>
        </motion.div>

        {/* Outer Split Layout Container */}
        <motion.div 
          variants={staggerContainer(0.05)}
          className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6 items-stretch h-auto xl:h-[480px] shrink-0 min-h-0"
        >
          
          {/* Left panel: input forms */}
          <motion.div 
            variants={professionalCardVariant}
            whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 md:px-6 md:py-5 flex flex-col gap-3 md:gap-4 shadow-xs hover:shadow-md hover:border-indigo-500/30 transition-colors transition-shadow duration-300 min-h-0"
          >
            <div className="pb-3 md:pb-4 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
              <h2 className="text-base font-bold font-display text-slate-800 dark:text-slate-100">
                Customize Cover Letter Details
              </h2>
            </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/40 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-semibold leading-normal">{error}</p>
                </div>
              )}

              <form onSubmit={handleGenerate} className="flex-1 flex flex-col min-h-0 gap-3 md:gap-4">
                {/* Resume Selector */}
                <div className="space-y-1.5 shrink-0">
                  <label className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Select Resume Profile</label>
                  <div className="relative">
                    {resumesLoading ? (
                      <div className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-400">
                        Loading your resumes...
                      </div>
                    ) : resumes.length === 0 ? (
                      <div className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-500 flex items-center justify-between">
                        <span>No resumes found. Please create a resume first.</span>
                        <button 
                          type="button" 
                          onClick={() => navigate('/dashboard')} 
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Create
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm text-slate-800 dark:text-slate-100 outline-none transition-all duration-300 focus:shadow-md focus:shadow-indigo-500/10 cursor-pointer"
                      >
                        {resumes.map((resume) => (
                          <option key={resume._id} value={resume._id}>
                            {resume.title} (ATS Score: {resume.atsMetadata?.score || 0}%)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Company & Title Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 shrink-0">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" /> Target Company
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm text-slate-800 dark:text-slate-100 outline-none transition-all duration-300 focus:shadow-md focus:shadow-indigo-500/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Target Job Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm text-slate-800 dark:text-slate-100 outline-none transition-all duration-300 focus:shadow-md focus:shadow-indigo-500/10"
                    />
                  </div>
                </div>

                {/* Job Description Textarea */}
                <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Job Description (Recommended)</label>
                  <textarea
                    placeholder="Paste the target job description to match skills and criteria..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm text-slate-800 dark:text-slate-100 outline-none transition-all duration-300 focus:shadow-md focus:shadow-indigo-500/10 resize-none min-h-[50px]"
                  />
                </div>

                <div className="mt-auto pt-2 shrink-0">
                  <motion.button
                    variants={buttonScale}
                    whileHover="hover"
                    whileTap="tap"
                    type="submit"
                    disabled={generating || resumes.length === 0}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-linear-to-r hover:from-indigo-600 hover:to-indigo-500 disabled:bg-indigo-600/60 text-white py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing & Crafting Cover Letter...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Cover Letter</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>

          {/* Right panel: preview cover letter */}
          <motion.div
            variants={professionalCardVariant}
            whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 md:px-6 md:py-5 flex flex-col shadow-xs hover:shadow-md hover:border-indigo-500/30 transition-colors transition-shadow duration-300 min-h-0"
          >
            {/* Header section with buttons */}
            <div className="flex-1 flex flex-col min-h-0 gap-3 md:gap-4">
              <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
                <h3 className="font-bold font-display text-base text-slate-800 dark:text-slate-100">
                  Cover Letter Preview
                </h3>
                {coverLetter && (
                  <div className="flex items-center gap-2">
                    {/* Save Button */}
                    <motion.button
                      variants={buttonScale}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleSave}
                      disabled={saving}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 disabled:opacity-50 ${
                        saveSuccess 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                      }`}
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : saveSuccess ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        </motion.div>
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{saveSuccess ? 'Saved!' : 'Save to History'}</span>
                    </motion.button>

                    <motion.button
                      variants={buttonScale}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleExportPdf}
                      disabled={exportingPdf || !exportCoverLetterId}
                      title={exportCoverLetterId ? 'Download PDF' : 'Save to history before exporting PDF'}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 disabled:cursor-not-allowed rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 ${
                        exportSuccess
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 disabled:bg-indigo-600/50'
                      }`}
                    >
                      {exportingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : exportSuccess ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                          <Check className="w-3.5 h-3.5" />
                        </motion.div>
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{exportingPdf ? 'Exporting...' : exportSuccess ? 'Exported' : 'Export PDF'}</span>
                    </motion.button>

                    <motion.button
                      variants={buttonScale}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300"
                    >
                      {copied ? (
                        <>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          </motion.div>
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Letter</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>

              {exportError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-semibold">{exportError}</p>
                </div>
              )}

              {/* Cover Letter Content Body */}
              <div className="flex-1 relative min-h-[300px] mt-2">
                <AnimatePresence mode="wait">
                  {generating ? (
                    <motion.div 
                      key="generating"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: premiumEase }}
                      className="space-y-3 animate-pulse p-4 absolute inset-0 bg-white dark:bg-slate-900 z-10"
                    >
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                      <div className="space-y-2 pt-3">
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                      </div>
                      <div className="space-y-2 pt-3">
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
                      </div>
                    </motion.div>
                  ) : coverLetter ? (
                    <motion.div 
                      key="content"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: premiumEase }}
                      className="absolute inset-0 p-4 bg-slate-50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-800/60 rounded-xl overflow-y-auto z-10"
                    >
                      <pre className="whitespace-pre-wrap text-[13px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed text-left">
                        {coverLetter}
                      </pre>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center py-8 text-slate-400 space-y-2 z-10 bg-white dark:bg-slate-900"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mx-auto">
                        <FileText className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-xs font-semibold max-w-[200px] mx-auto leading-relaxed">
                        Enter details and generate a cover letter to see your customized preview.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.main>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={async () => {
          await executeDelete(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        title="Delete Cover Letter?"
        description="Are you sure you want to delete this cover letter? This action is permanent and cannot be undone."
      />

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignoutConfirm(false)}
            />
            <motion.div
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative z-10 text-left space-y-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">Sign Out</h3>
              <p className="text-sm text-slate-500">Are you sure you want to end your current session?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSignoutConfirm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoverLetter;
