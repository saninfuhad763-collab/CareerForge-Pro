import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  ShieldCheck,
} from 'lucide-react';

const Login = () => {
  const {
    login,
    loading,
    error: authError,
    clearError,
    isAuthenticated,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
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
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    setServerError(null);

    const result = await login(data.email, data.password);

    if (!result.success) {
      setServerError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-black h-screen max-h-screen">
        {/* Soft Background Blurs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top: Logo Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              CareerForge Pro
            </h1>
            <p className="text-indigo-400/80 text-[10px] font-semibold tracking-wider uppercase">
              AI Resume Architect
            </p>
          </div>
        </div>

        {/* Middle: Hero Content & Feature Cards */}
        <div className="relative z-10 my-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Build ATS-Optimized
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"> Resumes</span>
              <br />
              That Get Interviews.
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Generate powerful AI-enhanced resumes tailored to any job
              description with intelligent ATS optimization.
            </p>

            <div className="space-y-3">
              <Feature
                icon={<FileText className="w-4 h-4" />}
                title="AI Resume Rewriting"
                text="Optimize every bullet point automatically."
              />

              <Feature
                icon={<ShieldCheck className="w-4 h-4" />}
                title="ATS Score Analysis"
                text="Match recruiter keywords intelligently."
              />

              <Feature
                icon={<Sparkles className="w-4 h-4" />}
                title="Professional Templates"
                text="Clean, modern and recruiter-friendly layouts."
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom: Trust Badge / Footer */}
        <div className="relative z-10 flex items-center gap-4 text-slate-500 text-[10px]">
          <p>© {new Date().getFullYear()} CareerForge Pro. All rights reserved.</p>
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <p className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Enterprise Secured
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
              <Sparkles className="text-white w-7 h-7" />
            </div>

            <h1 className="text-3xl font-bold text-white">
              CareerForge Pro
            </h1>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>

              <p className="text-slate-400 text-sm">
                Sign in to continue building your career.
              </p>
            </div>
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

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
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
                      required: 'Email is required',
                    })}
                  />
                </div>

                {errors.email && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

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
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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

              {/* Forgot */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Forgot Password?
                </button>
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-slate-400">
              Don’t have an account?{' '}
              <Link
                to="/signup"
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Create Account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, text }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/10 hover:translate-x-1 duration-200">
    <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
      {icon}
    </div>

    <div>
      <h4 className="text-white font-semibold text-sm mb-0.5">
        {title}
      </h4>

      <p className="text-slate-400 text-xs leading-relaxed">
        {text}
      </p>
    </div>
  </div>
);

export default Login;