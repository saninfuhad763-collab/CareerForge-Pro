import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Crown,
  FileText,
  CreditCard,
  Receipt,
  Activity,
  X
} from 'lucide-react';
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

const BillingDetails = () => {
  const navigate = useNavigate();
  const { user, checkAuth, getBillingStatus, cancelSubscription } = useAuthStore();

  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      await checkAuth();
      const result = await getBillingStatus();
      if (result.success) {
        setBilling(result.data);
      } else {
        setError(result.error || 'Failed to load billing status.');
      }
      setLoading(false);
    };
    load();
  }, [checkAuth, getBillingStatus]);

  const isPro = billing?.hasActiveSubscription || user?.plan === 'PRO';
  const isCanceled = billing?.subscriptionStatus === 'canceled' || user?.subscriptionStatus === 'canceled';
  const canCancel = isPro && !isCanceled;

  const formattedPeriodEnd = billing?.subscription?.currentPeriodEnd
    ? new Date(billing.subscription.currentPeriodEnd).toLocaleDateString()
    : billing?.subscriptionExpiresAt
    ? new Date(billing.subscriptionExpiresAt).toLocaleDateString()
    : 'the end of your current billing period';

  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    setCancelSuccess(null);

    try {
      const result = await cancelSubscription({ cancelAtPeriodEnd: true });
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel subscription.');
      }

      setCancelSuccess(
        result.message ||
          'Your cancellation request has been processed. Pro access will remain available until the end of your billing period.'
      );
      setShowCancelConfirm(false);

      await checkAuth();
      const statusResult = await getBillingStatus();
      if (statusResult.success) {
        setBilling(statusResult.data);
      }
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/6 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-400/5 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-10 space-y-12">
        {/* ── Header Actions Row ── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: premiumEase }}
          className="flex items-center justify-between gap-4"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>

          <button
            onClick={() => navigate('/billing')}
            className="inline-flex items-center gap-2 justify-center px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl shadow-sm transition-colors cursor-pointer group"
          >
            View Pricing & Plans
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: premiumEase, delay: 0.06 }}
          className="flex flex-col gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-slate-50">
              Billing Details
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
              Manage your subscription and billing information.
            </p>
          </div>
        </motion.div>

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

        {cancelError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{cancelError}</p>
          </motion.div>
        )}

        {cancelSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{cancelSuccess}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm font-semibold">Loading your billing details...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* ══ SECTION 1: Current Plan Status ══ */}
            <motion.div variants={itemVariants}>
              <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
                isPro
                  ? 'bg-gradient-to-br from-amber-500/8 via-amber-400/5 to-transparent border-amber-500/25 dark:border-amber-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                {isPro && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl" />
                  </div>
                )}

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Your Current Plan
                    </p>
                    <div className="flex items-center gap-3">
                      {isPro ? (
                        <>
                          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-slate-50">
                              PRO
                            </h2>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                              All features unlocked
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-500" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-slate-50">
                              FREE
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                              Basic access
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 capitalize">
                        {billing?.subscriptionStatus || (isPro ? 'active' : 'free')}
                      </p>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Renews / Expires</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {billing?.subscription?.currentPeriodEnd
                          ? new Date(billing.subscription.currentPeriodEnd).toLocaleDateString()
                          : billing?.subscriptionExpiresAt
                            ? new Date(billing.subscriptionExpiresAt).toLocaleDateString()
                            : '\u2014'}
                      </p>
                    </div>
                  </div>
                </div>

                {isPro && (
                  <div className="relative z-10 mt-6 pt-6 border-t border-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">
                        {isCanceled
                          ? `Your subscription will end on ${formattedPeriodEnd}. Pro features remain unlocked until then.`
                          : 'You have access to all Pro features. Enjoy unlimited resumes, AI rewrites, premium templates, and more.'}
                      </p>
                    </div>

                    {canCancel && !showCancelConfirm && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors cursor-pointer shrink-0"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                )}

                {/* Cancellation Confirmation Box */}
                {showCancelConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 mt-6 p-5 sm:p-6 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-red-950 dark:text-red-200">
                          Cancel at end of billing period
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                          Your Pro features will remain unlocked until{' '}
                          <span className="font-bold">{formattedPeriodEnd}</span>.
                          After that date, your subscription will not renew and your account will transition to the Free tier.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-75 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Confirm Cancellation</span>
                        )}
                      </button>

                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isCancelling}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Keep Subscription
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* ══ SECTION 2: Future Placeholders ══ */}
            <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Method</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {billing?.subscriptionProvider === 'razorpay'
                      ? 'Managed via Razorpay Subscriptions'
                      : billing?.subscriptionProvider === 'stripe'
                      ? 'Managed via Stripe checkout'
                      : isPro
                      ? 'Active Subscription'
                      : 'No active payment method'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Invoices</h3>
                  <p className="text-xs text-slate-500 mt-1">Available after first billing cycle</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Subscription Activity</h3>
                  <p className="text-xs text-slate-500 mt-1">No recent plan changes</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BillingDetails;
