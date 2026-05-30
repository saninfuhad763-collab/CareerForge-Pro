import { useEffect, useState } from 'react';
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
  Briefcase, 
  Clock,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Compass
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout, upgradePlan, checkAuth } = useAuthStore();
  const { 
    resumes, 
    loadResumes, 
    createResume, 
    deleteResume, 
    loading: storeLoading 
  } = useResumeStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resumes');

  const [createError, setCreateError] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const navigate = useNavigate();

  // Load user resumes on mount
  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const openCreateModal = () => {
    setCreateError(null);
    setUpgradeSuccess(false);
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

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setCreateError(null);
    const res = await upgradePlan();
    setUpgradeLoading(false);
    if (res.success) {
      setUpgradeSuccess(true);
      await checkAuth();
      // Auto-trigger creation after dynamic delay
      setTimeout(async () => {
        await handleCreateResume();
      }, 1200);
    } else {
      setCreateError(res.error || 'Failed to upgrade plan.');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    if (confirm('Are you sure you want to delete this resume? This action is permanent.')) {
      await deleteResume(id);
    }
  };

  // Compute stats
  const totalResumes = resumes.length;
  const avgAtsScore = totalResumes > 0 
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.atsMetadata?.score || 0), 0) / totalResumes) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Dynamic Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between p-6 shrink-0 md:sticky md:top-0 md:h-screen">
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold font-display">
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
                <p className="text-[10px] text-slate-400 truncate max-w-[85px]">{user?.email}</p>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded leading-none shrink-0 uppercase tracking-wider ${
                  user?.plan === 'PRO' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm' 
                    : 'bg-slate-200 dark:bg-slate-850 text-slate-500'
                }`}>
                  {user?.plan || 'FREE'}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Links */}
          <nav className="space-y-1 text-left">
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-colors cursor-pointer"
            >
              <Compass className="w-4.5 h-4.5" />
              <span>Back to Home</span>
            </button>
            <button 
              onClick={() => setActiveTab('resumes')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'resumes'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              <span>Resumes</span>
            </button>
            <button 
              onClick={() => setActiveTab('ai-scoring')}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'ai-scoring'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Gauge className="w-4.5 h-4.5" />
                <span>AI Scoring</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold transition-all ${
                activeTab === 'ai-scoring'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>Wk 2</span>
            </button>
            <button 
              onClick={() => setActiveTab('job-matcher')}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'job-matcher'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4.5 h-4.5" />
                <span>Job Matcher</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold transition-all ${
                activeTab === 'job-matcher'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>Wk 3</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Operations */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-4">
          {/* Pro Upgrade Promotion Box */}
          {user?.plan !== 'PRO' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white space-y-3 relative overflow-hidden shadow-md shadow-indigo-500/20 text-left">
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
                {upgradeLoading ? 'Activating Pro...' : 'Upgrade Now (Free)'}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        {activeTab === 'resumes' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Welcome Dashboard Banner Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-left space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Build, optimize, and scan your resumes to trigger interview call backs.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer self-start sm:self-center"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Create Resume</span>
              </button>
            </div>

            {/* Modular Analytics Placeholder Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Resumes</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">{totalResumes}</h3>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Gauge className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg ATS Score</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">
                    {avgAtsScore}%
                  </h3>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Roles</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">Locked</h3>
                </div>
              </div>
            </section>

            {/* Resumes Dashboard Listing */}
            <section className="space-y-6">
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
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
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
                    <span>Forge Resume</span>
                  </button>
                </div>
              ) : (
                /* Grid layout for resumes */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumes.map((resume) => {
                    const score = resume.atsMetadata?.score || 0;
                    let scoreColor = 'bg-red-500 text-white';
                    if (score >= 75) scoreColor = 'bg-emerald-500 text-white';
                    else if (score >= 55) scoreColor = 'bg-amber-500 text-white';

                    return (
                      <div
                        key={resume._id}
                        onClick={() => navigate(`/builder/${resume._id}`)}
                        className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 text-left flex flex-col justify-between h-48 cursor-pointer relative hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 transition-all duration-300 shadow-sm"
                      >
                        {/* Header */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-bold font-display text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
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
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleDelete(resume._id, e)}
                              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                              title="Delete Resume"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                            <span className="p-2 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/20 transition-all">
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {activeTab === 'ai-scoring' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-left"
          >
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <Gauge className="w-8 h-8 text-indigo-500 animate-pulse" />
                <span>AI Scoring & ATS Analytics Center</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track your active resume portfolios, review target keyword matches, and raise candidate rating metrics.
              </p>
            </div>

            {/* Quick Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Match Rating</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">{avgAtsScore}%</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Credits</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">10 / 10 Free</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highly Optimized Resumes</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-0.5">
                    {resumes.filter(r => (r.atsMetadata?.score || 0) >= 70).length} Profile(s)
                  </h3>
                </div>
              </div>
            </section>

            {/* Resume Analytics List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
              <h2 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
                Active Match Standings
              </h2>

              {resumes.length === 0 ? (
                <p className="text-sm text-slate-400">Create a resume first to run automated ATS matching analysis.</p>
              ) : (
                <div className="space-y-4">
                  {resumes.map((resume) => {
                    const score = resume.atsMetadata?.score || 0;
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
                      <div 
                        key={resume._id} 
                        onClick={() => navigate(`/builder/${resume._id}`)}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{resume.title}</h4>
                            <p className="text-xs text-slate-400">Last updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 self-end md:self-center">
                          <div className="text-right space-y-1">
                            <span className={`text-xs font-bold ${textColor}`}>ATS Match: {score}%</span>
                            <div className="w-32 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                            Optimize <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Instruction Widget */}
            <div className="p-6 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
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

        {activeTab === 'job-matcher' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-left"
          >
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-indigo-500" />
                <span>AI Job Matcher</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Match your generated ATS resumes against live corporate openings instantly using cosine similarity indexes.
              </p>
            </div>

            {/* Premium Job Matcher Locked Screen */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-10 min-h-[400px] flex flex-col justify-between">
              {/* Blur Overlay Banner */}
              <div className="absolute inset-0 bg-slate-50/20 dark:bg-slate-950/20 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md shadow-2xl space-y-5 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-lg">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">Week 3 Feature Preview</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      The automated AI Job Matcher will be fully unlocked in our Week 3 feature release! Prepare to connect to real-world job openings instantly with personalized application hooks.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20">
                      Unlocks in Week 3 Plan
                    </span>
                  </div>
                </div>
              </div>

              {/* Underlying Mock Layout to look highly realistic and premium */}
              <div className="space-y-6 opacity-30 select-none pointer-events-none">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300">Live Recommendations</h3>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">3 Jobs Found</span>
                </div>

                <div className="space-y-4">
                  {[
                    { role: 'Senior React Developer', comp: 'InnovateTech Solutions', match: '96%' },
                    { role: 'Frontend Engineer', comp: 'Quantum Labs LLC', match: '89%' },
                    { role: 'Full-Stack MERN Architect', comp: 'SaaSify Inc.', match: '83%' },
                  ].map((job, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{job.role}</h4>
                        <p className="text-xs text-slate-500">{job.comp}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded">
                        {job.match} Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
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
                    
                    {/* Simulated direct upgrade option since it's sandbox testing */}
                    {createError.includes('Free tier is limited') && (
                      <button
                        type="button"
                        onClick={handleUpgrade}
                        disabled={upgradeLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {upgradeLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Unlocking Pro Access...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span>Instantly Upgrade to PRO (Free sandbox checkout)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {upgradeSuccess && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">Congratulations!</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        You have successfully upgraded to the **PRO Plan**! Initializing resume generation...
                      </p>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resume Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer Resume"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-800 dark:text-slate-100 input-focus-glow transition-all"
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
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`p-3 text-left border rounded-xl flex flex-col justify-between transition-all ${
                          selectedTemplate === tpl.id
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-950/50'
                        }`}
                      >
                        <span className={`text-xs font-bold ${selectedTemplate === tpl.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {tpl.name}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate mt-1 leading-none">{tpl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !newTitle.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-500/10"
                  >
                    {actionLoading ? 'Initializing...' : 'Forge Resume'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
