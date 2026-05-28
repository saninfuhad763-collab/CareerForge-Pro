import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  ShieldCheck,
  Rocket,
} from 'lucide-react';

const Signup = () => {
  const {
    register: signup,
    loading,
    error: authError,
    clearError,
    isAuthenticated,
  } = useAuthStore();

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
    },
  });

  useEffect(() => {
    clearError();
    setServerError(null);
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setServerError(null);

    const result = await signup(
      data.name,
      data.email,
      data.password
    );

    if (!result.success) {
      setServerError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-black">
        
        {/* Glow Effects */}
        <div className="absolute top-20 left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-xl px-12">
          
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  CareerForge Pro
                </h1>

                <p className="text-slate-400 text-sm">
                  AI Resume Architect
                </p>
              </div>
            </div>

            {/* Hero Text */}
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Start Building
              <span className="text-indigo-400"> Smarter</span>
              <br />
              Resumes Today.
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Create ATS-optimized resumes powered by AI and land
              more interviews with intelligent job matching.
            </p>

            {/* Feature Cards */}
            <div className="space-y-5">
              <Feature
                icon={<Rocket className="w-5 h-5" />}
                title="Instant Resume Generation"
                text="Create modern resumes in minutes."
              />

              <Feature
                icon={<FileText className="w-5 h-5" />}
                title="AI Keyword Optimization"
                text="Improve ATS score automatically."
              />

              <Feature
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Professional Templates"
                text="Designed for recruiters and hiring systems."
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 p-6 relative">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20 mb-4">
              <Sparkles className="text-white w-7 h-7" />
            </div>

            <h1 className="text-3xl font-bold text-white">
              CareerForge Pro
            </h1>
          </div>

          {/* Signup Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>

              <p className="text-slate-400 text-sm">
                Start building AI-powered resumes today.
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {(serverError || authError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 flex gap-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{serverError || authError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORM */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Name */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border ${
                      errors.name
                        ? 'border-red-500'
                        : 'border-white/10 focus:border-indigo-500'
                    } outline-none text-white placeholder:text-slate-500 transition-all`}
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message:
                          'Name must be at least 2 characters',
                      },
                    })}
                  />
                </div>

                {errors.name && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border ${
                      errors.email
                        ? 'border-red-500'
                        : 'border-white/10 focus:border-indigo-500'
                    } outline-none text-white placeholder:text-slate-500 transition-all`}
                    {...register('email', {
                      required: 'Email address is required',
                    })}
                  />
                </div>

                {errors.email && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full h-14 pl-12 pr-12 rounded-2xl bg-white/5 border ${
                      errors.password
                        ? 'border-red-500'
                        : 'border-white/10 focus:border-indigo-500'
                    } outline-none text-white placeholder:text-slate-500 transition-all`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message:
                          'Password must be at least 6 characters',
                      },
                    })}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, text }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
      {icon}
    </div>

    <div>
      <h4 className="text-white font-semibold mb-1">
        {title}
      </h4>

      <p className="text-slate-400 text-sm">
        {text}
      </p>
    </div>
  </div>
);

export default Signup;