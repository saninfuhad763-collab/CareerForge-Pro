import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Sparkles, Crown, Check, X, Zap, Shield, FileText, Star, Infinity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { premiumEase } from '../animations/motionVariants';

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: premiumEase } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: premiumEase } },
};

/* ─── Feature Check/Cross Helper ─── */
const FeatureCell = ({ available }) =>
  available ? (
    <div className="flex justify-center">
      <span className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
        <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
      </span>
    </div>
  ) : (
    <div className="flex justify-center">
      <span className="w-5 h-5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 flex items-center justify-center">
        <X className="w-3 h-3 text-slate-400" strokeWidth={3} />
      </span>
    </div>
  );

/* ─── Comparison Table Data ─── */
const comparisonRows = [
  { label: 'Resume Limit',            free: '1 Resume',    pro: 'Unlimited',  freeAvail: true,  proAvail: true  },
  { label: 'AI Rewrite Limit',        free: '10 Rewrites', pro: 'Unlimited',  freeAvail: true,  proAvail: true  },
  { label: 'ATS Analysis',            free: true,          pro: true,         freeAvail: true,  proAvail: true  },
  { label: 'Resume Upload',           free: true,          pro: true,         freeAvail: true,  proAvail: true  },
  { label: 'Resume PDF Export',       free: true,          pro: true,         freeAvail: true,  proAvail: true  },
  { label: 'Cover Letter Generator',  free: true,          pro: true,         freeAvail: true,  proAvail: true  },
  { label: 'Cover Letter PDF Export', free: true,          pro: true,         freeAvail: true,  proAvail: true  },
  { label: 'Premium Templates',       free: false,         pro: true,         freeAvail: false, proAvail: true  },
];

/* ─── Free Plan Features ─── */
const freeFeatures = [
  { icon: FileText, text: '1 Resume' },
  { icon: Zap,      text: '10 AI Rewrites' },
  { icon: Shield,   text: 'ATS Analysis' },
  { icon: Star,     text: 'Modern Template' },
];

/* ─── Pro Plan Features ─── */
const proFeatures = [
  { icon: Infinity, text: 'Unlimited Resumes' },
  { icon: Zap,      text: 'Unlimited AI Rewrites' },
  { icon: Shield,   text: 'ATS Analysis' },
  { icon: Crown,    text: 'Premium Templates' },
  { icon: Sparkles, text: 'Priority Features' },
];

/* ════════════════════════════════════════════════════════════════ */
const Billing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkAuth, getBillingStatus } = useAuthStore();

  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const checkoutResult = searchParams.get('checkout');

  /* ── Load billing status ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await getBillingStatus();
      if (result.success) {
        setBilling(result.data);
      } else {
        setError(result.error || 'Failed to load billing status.');
      }
      setLoading(false);
    };
    load();
  }, [getBillingStatus]);

  /* ── Handle checkout redirects ── */
  useEffect(() => {
    if (checkoutResult === 'success') {
      setTimeout(() => {
        setSuccessMessage('Payment successful! Your Pro subscription is now active.');
      }, 0);
      checkAuth();
      getBillingStatus().then((result) => {
        if (result.success) setBilling(result.data);
      });
    } else if (checkoutResult === 'cancelled') {
      setTimeout(() => {
        setError('Checkout was cancelled. No charges were made.');
      }, 0);
    }
  }, [checkoutResult, checkAuth, getBillingStatus]);

  const isPro = billing?.hasActiveSubscription || user?.plan === 'PRO';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/6 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-400/5 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-6 space-y-8">

        {/* ── Back Navigation ── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: premiumEase }}
          className="flex justify-between items-center"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/billing/details')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all cursor-pointer"
          >
            Billing Details
          </button>
        </motion.div>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: premiumEase, delay: 0.06 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Pricing &amp; Plans
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-slate-50 leading-tight">
            Supercharge your{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              career journey
            </span>
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Choose the plan that fits your goals. Upgrade anytime to unlock unlimited power.
          </p>
        </motion.div>

        {/* ── Alert Banners ── */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{successMessage}</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm font-semibold">Loading your plan details...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >


            {/* ══ SECTION 2: Pricing Cards ══ */}
            <motion.div variants={itemVariants}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* ── FREE PLAN CARD ── */}
                <motion.div
                  variants={cardVariants}
                  className={`relative rounded-3xl border p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    !isPro
                      ? 'bg-white dark:bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/5 dark:shadow-indigo-500/10 ring-2 ring-indigo-500/20 hover:shadow-indigo-500/15'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/30'
                  }`}
                >
                  {!isPro && (
                    <div className="absolute top-6 right-6 z-10">
                      <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md shadow-indigo-500/30">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="space-y-5 flex-1">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-slate-50">Free</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get started for free</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold font-display text-slate-900 dark:text-slate-50">$0</span>
                        <span className="text-sm text-slate-400 font-medium">/ month</span>
                      </div>
                    </div>

                    <ul className="space-y-2.5">
                      {freeFeatures.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Icon className="w-3 h-3 text-slate-500" />
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                    {!isPro ? (
                      <div className="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-sm font-bold text-slate-500">
                        Current Plan: FREE
                      </div>
                    ) : (
                      <div className="w-full py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center text-sm font-semibold text-slate-400">
                        Free Tier
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* ── PRO PLAN CARD ── */}
                <motion.div
                  variants={cardVariants}
                  className="relative rounded-3xl border p-7 flex flex-col overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 border-indigo-500 shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/8 blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-purple-400/10 blur-xl" />
                  </div>

                  {isPro && (
                    <div className="absolute top-6 right-6 z-10">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold uppercase tracking-widest shadow-md shadow-amber-400/30">
                        Your Plan
                      </span>
                    </div>
                  )}

                  {!isPro && (
                    <div className="absolute top-6 right-6 z-10">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold uppercase tracking-widest shadow-md shadow-amber-400/30">
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className="relative z-10 space-y-5 flex-1">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                        <Crown className="w-5 h-5 text-amber-300" />
                      </div>
                      <h3 className="text-xl font-extrabold font-display text-white">Pro</h3>
                      <p className="text-sm text-indigo-200 mt-1">Everything you need to succeed</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold font-display text-white">$9</span>
                        <span className="text-sm text-indigo-200 font-medium">/ month</span>
                      </div>
                    </div>

                    <ul className="space-y-2.5">
                      {proFeatures.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                            <Icon className="w-3 h-3 text-white" />
                          </span>
                          <span className="text-sm text-indigo-50 font-medium">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative z-10 mt-auto pt-6 border-t border-white/15">
                    {isPro ? (
                      <div className="w-full py-3.5 rounded-xl bg-white/15 border border-white/20 text-center text-sm font-bold text-white">
                        Current Plan: PRO
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate('/billing')}
                        className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-600 font-extrabold text-sm transition-all duration-300 shadow-lg shadow-indigo-950/20 cursor-pointer flex items-center justify-center gap-2 group hover:-translate-y-0.5"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* ══ SECTION 3: Feature Comparison Table ══ */}
            <motion.div variants={itemVariants} className="space-y-5">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
                  Feature Comparison
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  See exactly what is included in each plan.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                  <div className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Feature</span>
                  </div>
                  <div className="px-4 py-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Free</span>
                      <span className="text-[10px] text-slate-400 font-semibold">$0/mo</span>
                    </div>
                  </div>
                  <div className="px-4 py-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-500" /> Pro
                      </span>
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold">$9/mo</span>
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonRows.map((row, idx) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-3 items-center hover:bg-slate-50/70 dark:hover:bg-slate-950/40 transition-colors duration-300 ${
                        idx % 2 === 0 ? '' : 'bg-slate-50/40 dark:bg-slate-950/20'
                      }`}
                    >
                      <div className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{row.label}</span>
                      </div>

                      <div className="px-4 py-4">
                        {typeof row.free === 'string' ? (
                          <p className="text-center text-xs font-bold text-slate-600 dark:text-slate-400">{row.free}</p>
                        ) : (
                          <FeatureCell available={row.freeAvail} />
                        )}
                      </div>

                      <div className="px-4 py-4">
                        {typeof row.pro === 'string' ? (
                          <p className="text-center text-xs font-bold text-indigo-600 dark:text-indigo-400">{row.pro}</p>
                        ) : (
                          <FeatureCell available={row.proAvail} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {!isPro && (
                  <div className="px-6 py-5 bg-gradient-to-r from-indigo-500/8 to-purple-500/5 border-t border-indigo-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Ready to unlock the full suite?
                    </p>
                    <button
                      onClick={() => navigate('/billing')}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/15 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-4 h-4" />
                      Upgrade to Pro
                    </button>
                  </div>
                )}

                {isPro && (
                  <div className="px-6 py-5 bg-gradient-to-r from-amber-500/8 to-amber-400/5 border-t border-amber-500/15 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      You have access to every feature in this table.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ══ SECTION 4: Trust Signals ══ */}
            <motion.div variants={itemVariants}>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Shield,
                    title: 'Secure & Private',
                    desc: 'Your resume data is encrypted and never shared.',
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                  },
                  {
                    icon: Zap,
                    title: 'Instant Access',
                    desc: 'Features activate immediately after upgrading.',
                    color: 'text-indigo-500',
                    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
                  },
                  {
                    icon: Star,
                    title: 'Premium Quality',
                    desc: 'ATS-optimized templates trusted by professionals.',
                    color: 'text-amber-500',
                    bg: 'bg-amber-50 dark:bg-amber-950/30',
                  },
                ].map(({ icon: Icon, title, desc, color, bg }) => (
                  <div
                    key={title}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm"
                  >
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Billing;
