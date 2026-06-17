import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Crown,
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { premiumEase } from '../animations/motionVariants';

const Billing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkAuth, createCheckoutSession, cancelSubscription, getBillingStatus } = useAuthStore();

  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const checkoutResult = searchParams.get('checkout');

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

  useEffect(() => {
    if (checkoutResult === 'success') {
      setSuccessMessage('Payment successful! Your Pro subscription is now active.');
      checkAuth();
      getBillingStatus().then((result) => {
        if (result.success) setBilling(result.data);
      });
    } else if (checkoutResult === 'cancelled') {
      setError('Checkout was cancelled. No charges were made.');
    }
  }, [checkoutResult, checkAuth, getBillingStatus]);

  const handleUpgrade = async () => {
    setActionLoading(true);
    setError(null);
    const result = await createCheckoutSession();
    setActionLoading(false);

    if (result.success && result.url) {
      window.location.href = result.url;
      return;
    }
    setError(result.error || 'Failed to start checkout.');
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your Pro subscription at the end of the current billing period?')) {
      return;
    }

    setActionLoading(true);
    setError(null);
    const result = await cancelSubscription();
    setActionLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Subscription cancellation scheduled.');
      await checkAuth();
      const status = await getBillingStatus();
      if (status.success) setBilling(status.data);
    } else {
      setError(result.error || 'Failed to cancel subscription.');
    }
  };

  const isPro = billing?.hasActiveSubscription || user?.plan === 'PRO';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <Link to="/dashboard" className="text-sm font-bold text-indigo-600 hover:underline">
            CareerForge Pro
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: premiumEase }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-500" />
            Billing & Subscription
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your CareerForge Pro plan, subscription status, and premium features.
          </p>
        </motion.div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm font-semibold">Loading billing details...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Plan</p>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
                    {isPro ? (
                      <>
                        <Crown className="w-6 h-6 text-amber-500" />
                        PRO
                      </>
                    ) : (
                      'FREE'
                    )}
                  </h2>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isPro
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {billing?.subscriptionStatus || user?.subscriptionStatus || 'none'}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subscription Status</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 capitalize">
                    {billing?.subscriptionStatus || 'none'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Renews / Expires</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {billing?.subscription?.currentPeriodEnd
                      ? new Date(billing.subscription.currentPeriodEnd).toLocaleDateString()
                      : billing?.subscriptionExpiresAt
                        ? new Date(billing.subscriptionExpiresAt).toLocaleDateString()
                        : '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan Features</p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> {isPro ? 'Unlimited resumes' : '1 resume'}</li>
                  <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> {isPro ? 'Unlimited AI rewrites' : '10 AI rewrites'}</li>
                  <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> {isPro ? 'All templates (Modern, Classic, Minimalist)' : 'Modern template only'}</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!isPro ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Upgrade to Pro
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading || billing?.subscription?.cancelAtPeriodEnd}
                    className="inline-flex items-center justify-center gap-2 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-60 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {billing?.subscription?.cancelAtPeriodEnd ? 'Cancellation Scheduled' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
