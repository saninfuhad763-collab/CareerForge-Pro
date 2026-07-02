import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { 
  Palette, 
  User, 
  CreditCard, 
  LifeBuoy, 
  Info,
  ExternalLink,
  Mail,
  AlertTriangle,
  Monitor
} from 'lucide-react';
import { staggerContainer, staggerItem } from '../animations/staggerAnimations';

const SettingsView = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <motion.section 
      variants={staggerContainer(0.05)}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
            Account Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your application preferences and account details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <motion.div variants={staggerItem} className="glass-card bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">Appearance</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">System Default</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Follows your operating system appearance</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md">Active</span>
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div variants={staggerItem} className="glass-card bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">Account Profile</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                {user?.name || 'Not provided'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                {user?.email || 'Not provided'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div variants={staggerItem} className="glass-card bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">Subscription</h3>
          </div>
          
          <div className="flex flex-col flex-1 justify-between gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Plan</span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wide ${
                user?.plan === 'PRO'
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {user?.plan || 'FREE'}
              </span>
            </div>
            
            <button
              onClick={() => navigate('/billing')}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <span>{user?.plan === 'PRO' ? 'Manage Subscription' : 'Upgrade to Pro'}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div variants={staggerItem} className="glass-card bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">Support</h3>
          </div>
          
          <div className="flex flex-col flex-1 gap-3">
            <button
              onClick={() => navigate('/contact')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-xl text-left transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Contact Us</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 rounded-xl text-left transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400">Report an Issue</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
            </button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div variants={staggerItem} className="md:col-span-2 glass-card bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">About CareerForge Pro</h3>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Version 1.0</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Premium ATS-Optimized Resume Builder.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'].map((tech) => (
                <span key={tech} className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SettingsView;
