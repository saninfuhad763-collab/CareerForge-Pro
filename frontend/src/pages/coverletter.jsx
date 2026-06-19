import { useEffect, useState } from 'react';
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
  ChevronRight,
} from 'lucide-react';
import { isProUser } from '../utils/planConstants';
import { staggerContainer, staggerItem } from '../animations/staggerAnimations';
import { buttonScale } from '../animations/cardAnimations';
import { sidebarItemVariant } from '../animations/dashboardAnimations';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CoverLetter = () => {
  const { user, logout, upgradePlan } = useAuthStore();
  const { resumes, loadResumes, loading: resumesLoading } = useResumeStore();
  const navigate = useNavigate();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0]._id);
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
    setCoverLetter('');

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
    } catch (err) {
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

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setError('');
    const res = await upgradePlan();
    setUpgradeLoading(false);
    if (res.success && res.url) {
      window.location.href = res.url;
      return;
    }
    setError(res.error || 'Failed to start Stripe checkout.');
  };

  const isPro = isProUser(user);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between p-6 shrink-0 md:sticky md:top-0 md:h-screen z-20">
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
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
                    ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-sm' 
                    : 'bg-slate-200 dark:bg-slate-850 text-slate-500'
                }`}>
                  {user?.plan || 'FREE'}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Links */}
          <nav className="space-y-1 text-left">
            <motion.button 
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-colors cursor-pointer"
              whileHover="hover"
              variants={sidebarItemVariant}
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span>Back to Dashboard</span>
            </motion.button>
            <motion.button 
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-colors cursor-pointer"
              whileHover="hover"
              variants={sidebarItemVariant}
            >
              <Compass className="w-4.5 h-4.5" />
              <span>Explore Resumes</span>
            </motion.button>
            <motion.button 
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all cursor-pointer"
              whileHover="hover"
              variants={sidebarItemVariant}
            >
              <FileText className="w-4.5 h-4.5" />
              <span>Cover Letter</span>
            </motion.button>
          </nav>
        </div>

        {/* Sidebar Footer Operations */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-4">
          {user?.plan !== 'PRO' && !isPro && (
            <div className="p-4 rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white space-y-3 relative overflow-hidden shadow-md shadow-indigo-500/20 text-left">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-400 text-slate-900 font-extrabold text-[8px] rounded uppercase tracking-wider">
                  <Sparkles className="w-2 h-2 fill-current" /> Premium
                </span>
                <h4 className="font-bold text-xs font-display">Upgrade to Pro Plan</h4>
                <p className="text-[10px] text-indigo-100 leading-normal">
                  Unlock unlimited resume generation, keyword analytics, and premium templates!
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full bg-white hover:bg-slate-50 text-indigo-600 disabled:opacity-50 transition-colors py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-950/20 cursor-pointer"
              >
                {upgradeLoading ? 'Redirecting to Stripe...' : 'Upgrade with Stripe'}
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/billing')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-colors cursor-pointer"
          >
            <CreditCard className="w-4.5 h-4.5" />
            <span>Billing</span>
          </button>

          <button
            onClick={() => setShowSignoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen text-left">
        {/* Banner Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-500 animate-pulse" />
            <span>AI Cover Letter Generator</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate custom professional cover letters that highlight your strengths aligned with the target job.
          </p>
        </div>

        {/* Outer Split Layout Container */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          
          {/* Left panel: input forms */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs"
          >
            <h2 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
              Customize Cover Letter Details
            </h2>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/40 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-semibold leading-normal">{error}</p>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Resume Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Select Resume Profile</label>
                <div className="relative">
                  {resumesLoading ? (
                    <div className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-400">
                      Loading your resumes...
                    </div>
                  ) : resumes.length === 0 ? (
                    <div className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-500 flex items-center justify-between">
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
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none transition-all cursor-pointer"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Target Company
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Target Job Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Job Description Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Description (Recommended)</label>
                <textarea
                  rows={6}
                  placeholder="Paste the target job description to match skills and criteria..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none transition-all resize-y"
                />
              </div>

              <motion.button
                type="submit"
                disabled={generating || resumes.length === 0}
                variants={buttonScale}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer disabled:cursor-not-allowed"
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
            </form>
          </motion.div>

          {/* Right panel: preview cover letter */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[500px] shadow-xs"
          >
            {/* Header section with buttons */}
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold font-display text-slate-800 dark:text-slate-100">
                  Cover Letter Preview
                </h3>
                {coverLetter && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Letter</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Cover Letter Content Body */}
              <div className="flex-1 flex flex-col justify-center mt-2">
                {generating ? (
                  <div className="space-y-4 animate-pulse p-4">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                    <div className="space-y-2 pt-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                    </div>
                    <div className="space-y-2 pt-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 pt-4" />
                  </div>
                ) : coverLetter ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-800/60 rounded-2xl max-h-[450px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed text-left">
                      {coverLetter}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold max-w-xs mx-auto">
                      Enter details and generate a cover letter to see your customized preview.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

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
