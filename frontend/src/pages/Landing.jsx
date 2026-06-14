import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { 
  Sparkles, 
  FileText, 
  Gauge, 
  FileCheck, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  Zap,
  ArrowUp
} from 'lucide-react';
import { staggerContainer, staggerItem, staggerItemScale } from '../animations/staggerAnimations';
import { premiumCardHover, cardTiltLeft as _cardTiltLeft, cardTiltRight as _cardTiltRight, buttonScale } from '../animations/cardAnimations';
import { scrollReveal, progressConnector as _progressConnector } from '../animations/scrollAnimations';
import { premiumEase } from '../animations/motionVariants';

const Landing = () => {
  const { isAuthenticated } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative Blur Blobs with smooth continuous floating animations */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-[20%] right-[-10%] w-150 h-150 bg-emerald-100/40 dark:bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Header Navigation with elegant slide-down and dynamic fixed layout */}
      <div className="fixed top-4 left-0 right-0 z-50 w-full flex justify-center px-4">
        <motion.nav 
          className={`
            relative w-full max-w-7xl flex items-center justify-between border rounded-2xl px-6 py-4 transition-all duration-300
            ${isScrolled 
              ? 'border-indigo-500/25 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-indigo-500/5 dark:shadow-indigo-500/10' 
              : 'border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md shadow-sm'
            }
          `}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: premiumEase }}
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg font-display">
              CF
            </div>
            <span className="font-bold text-xl font-display text-slate-800 dark:text-slate-100 tracking-tight">
              CareerForge <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 absolute left-1/2 -translate-x-1/2">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Workflow</a>
            <a href="#stats" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Why CareerForge</a>
          </div>
          <div className="flex items-center gap-4 relative">
            <AnimatePresence>
              {isScrolled && (
                <motion.button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  initial={{ opacity: 0, scale: 0.8, x: 15 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 15 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-full mr-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40 shadow-sm cursor-pointer whitespace-nowrap"
                  title="Scroll to top"
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.6, 
                      ease: "easeInOut" 
                    }}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>

            {isAuthenticated ? (
              <motion.div variants={buttonScale} initial="initial" whileHover="hover" whileTap="tap">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-indigo-500/10"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 transition-colors">
                  Sign In
                </Link>
                <motion.div variants={buttonScale} initial="initial" whileHover="hover" whileTap="tap">
                  <Link
                    to="/signup"
                    className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-28 pb-24 md:pt-36 md:pb-32 grid md:grid-cols-12 gap-12 items-center relative z-10">
        <motion.div 
          className="md:col-span-7 space-y-6 text-left"
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.12)}
        >
          <motion.div 
            variants={staggerItem}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" /> CareerForge Pro: ATS Resume Builder
          </motion.div>
          <motion.h1 
            variants={staggerItem}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-display leading-[1.1]"
          >
            Forge an <span className="bg-linear-to-r from-indigo-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">ATS-Proof</span> Resume in Real Time.
          </motion.h1>
          <motion.p 
            variants={staggerItem}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
          >
            Build clean, highly optimized resumes designed specifically to beat applicant tracking bots. Edit sections dynamically, view structural layouts instantly, and stand out to top hiring teams.
          </motion.p>
          
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <motion.div variants={buttonScale} initial="initial" whileHover="hover" whileTap="tap">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-500/20 transition-all"
              >
                Build Your ATS-Proof Resume Now
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div variants={buttonScale} initial="initial" whileHover="hover" whileTap="tap">
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 px-7 py-4 rounded-2xl font-semibold transition-all"
              >
                Explore Features
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero Interactive Preview Card */}
        <motion.div 
          className="md:col-span-5 relative"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: premiumEase }}
        >
          <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-3xl blur-2xl" />
          <motion.div 
            className="relative glass-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
            variants={premiumCardHover}
            initial="initial"
            whileHover="hover"
          >
            {/* Visualizer Score */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                <Gauge className="w-4 h-4" /> ATS SCORE: 92%
              </div>
            </div>

            {/* Resume Wireframe Mockup */}
            <div className="space-y-5 pt-6 text-left">
              <div className="space-y-2">
                <div className="h-5 w-2/3 bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <div className="h-4 w-1/4 bg-indigo-200 dark:bg-indigo-900/50 rounded-md" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-2.5 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-2.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="h-4 w-1/3 bg-indigo-200 dark:bg-indigo-900/50 rounded-md" />
                <div className="flex gap-2 flex-wrap">
                  {['React', 'Node.js', 'MongoDB', 'System Design', 'Express', 'Tailwind'].map((skill, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Glowing check overlay with premium floating bounce */}
            <motion.div 
              className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-medium text-slate-400">Structural Check</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">100% Parsable</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Cards Grid with Staggered Scroll Reveal */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-200/50 dark:border-slate-900/50 scroll-mt-32">
        <motion.div 
          className="text-center space-y-4 max-w-2xl mx-auto mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          variants={scrollReveal}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-slate-50">
            Engineered to Secure Interviews
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
            Every layer of CareerForge Pro is fine-tuned to beat applicant tracking bots, keeping recruiters engaged with clear presentation formats.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          variants={staggerContainer(0.12)}
        >
          {/* Card 1 */}
          <motion.div 
            variants={staggerItem}
            whileHover="hover"
            className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col text-left space-y-4 shadow-sm"
            custom={0}
          >
            <motion.div 
              variants={premiumCardHover} 
              className="w-full h-full flex flex-col space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg font-display text-slate-800 dark:text-slate-100">Split-Screen Live Editor</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Edit experience, education, skills, and projects in our structured form panel while watching your professional ATS resume adapt in real-time.
              </p>
            </motion.div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={staggerItem}
            whileHover="hover"
            className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col text-left space-y-4 shadow-sm"
            custom={1}
          >
            <motion.div 
              variants={premiumCardHover}
              className="w-full h-full flex flex-col space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg font-display text-slate-800 dark:text-slate-100">Baseline ATS Checker</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Get immediate, dynamic structural feedback. Identify missing sections and keyword counts on the fly as you assemble your draft.
              </p>
            </motion.div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={staggerItem}
            whileHover="hover"
            className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col text-left space-y-4 shadow-sm"
            custom={2}
          >
            <motion.div 
              variants={premiumCardHover}
              className="w-full h-full flex flex-col space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg font-display text-slate-800 dark:text-slate-100">Dynamic Section Sorting</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Rearrange resume flow instantly (e.g. shift Skills above Experience, or Projects below Education) depending on your target role.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Walkthrough */}
      <section id="workflow" className="bg-slate-100/50 dark:bg-slate-900/30 py-20 border-y border-slate-200/30 dark:border-slate-900/30 relative z-10 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6 text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            variants={staggerContainer(0.12)}
          >
            <motion.h2 
              variants={staggerItem}
              className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-slate-50"
            >
              Future-Proof Foundation Designed for Scale
            </motion.h2>
            <motion.p 
              variants={staggerItem}
              className="text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              Built on production-grade Node, Express, MongoDB and Zustand state synchronization. Our architecture is pre-configured and ready to unlock next-generation features:
            </motion.p>
            
            <motion.ul className="space-y-4" variants={staggerContainer(0.08)}>
              {[
                { title: 'AI Copywriting & Tone Sync', desc: 'Optimize summaries and generate impact bullets on demand (Week 2 ready).' },
                { title: 'PDF Generation Engine', desc: 'High-fidelity PDF output matching professional templates pixel-for-pixel.' },
                { title: 'Job Matching Matrix', desc: 'Cross-reference resume keywords against scraping APIs instantly.' },
              ].map((item, idx) => (
                <motion.li key={idx} className="flex gap-3" variants={staggerItem}>
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                    <Zap className="w-3 h-3 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          
          <motion.div 
            className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            variants={scrollReveal}
          >
            {/* Soft decorative background pulse */}
            <motion.div 
              className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="text-slate-800 dark:text-slate-200 text-left font-mono text-xs space-y-4">
              <p className="text-emerald-500">// Scalable Resume Data Schema Definition</p>
              <p>const resumeSchema = new Schema(&#123;</p>
              <p className="pl-4">userId: Schema.Types.ObjectId,</p>
              <p className="pl-4 text-indigo-400">sectionOrder: [String], // Drag & drop ready</p>
              <p className="pl-4 text-indigo-400">customSections: [CustomSectionSchema],</p>
              <p className="pl-4 text-indigo-400">atsMetadata: &#123; score: Number, feedback: [String] &#125;</p>
              <p>&#125;);</p>
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center text-[10px] text-slate-400 font-sans">
                <span>Schema parsed & verified</span>
                <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="stats" className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10 scroll-mt-32">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          variants={staggerContainer(0.1)}
        >
          {[
            { metric: '98%', label: 'ATS Parsable Success' },
            { metric: '10x', label: 'Faster Interview Invites' },
            { metric: '45k+', label: 'Job Matches Processed' },
            { metric: '100%', label: 'Data Security Compliant' },
          ].map((stat, idx) => (
            <motion.div key={idx} className="space-y-2" variants={staggerItemScale}>
              <h3 className="text-4xl md:text-5xl font-extrabold font-display text-indigo-600 dark:text-indigo-400 tracking-tight">{stat.metric}</h3>
              <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-900/50 py-12 relative z-10 text-slate-400 dark:text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              CF
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 font-display">CareerForge Pro</span>
          </div>
          <p>© 2026 CareerForge Pro. Developed with Enterprise Standards.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
