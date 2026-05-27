import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const Signup = () => {
  const { register: signup, loading, error: authError, clearError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });

  // Clear errors on mount
  useEffect(() => {
    clearError();
    setServerError(null);
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setServerError(null);
    const result = await signup(data.name, data.email, data.password);
    if (!result.success) {
      setServerError(result.error);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-200/40 dark:bg-indigo-900/10 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-100/40 dark:bg-emerald-950/10 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '4s' }} />

      <motion.div
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back Link */}
        <div className="mb-6 text-left">
          <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1">
            ← Back to Homepage
          </Link>
        </div>

        {/* Brand/Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 mx-auto">
            CF
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Get started by creating your ATS-Proof profile</p>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence mode="wait">
          {(serverError || authError) && (
            <motion.div
              className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm text-left"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{serverError || authError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${
                  errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                } rounded-xl text-sm text-slate-800 dark:text-slate-100 input-focus-glow transition-all`}
                {...register('name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
            </div>
            {errors.name && (
              <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                } rounded-xl text-sm text-slate-800 dark:text-slate-100 input-focus-glow transition-all`}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                } rounded-xl text-sm text-slate-800 dark:text-slate-100 input-focus-glow transition-all`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Redirect Link */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
