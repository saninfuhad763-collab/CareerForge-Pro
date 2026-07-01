import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin, Globe, Send, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Simple Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-sm font-display">
              CF
            </div>
            <span className="font-bold text-lg font-display text-slate-800 dark:text-slate-100 tracking-tight">
              CareerForge <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
            </span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white"
          >
            Get in <span className="text-indigo-600 dark:text-indigo-400">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Have questions about CareerForge Pro? Want to discuss enterprise licensing, or report an issue? We're here to help.
          </motion.p>
        </div>
      </section>

      {/* Split Layout: Contact Card & Form */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Contact Card (Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 p-8 space-y-8 h-full">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 mb-2">Contact Information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Fill out the form to send a direct message, or reach out through any of our professional channels below.
                </p>
              </div>

              <div className="space-y-6">
                <a href="mailto:support@careerforge.pro" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Support</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">support@careerforge.pro</div>
                  </div>
                </a>

                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Open Source</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">github.com/careerforge</div>
                  </div>
                </a>

                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Network</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">CareerForge Official</div>
                  </div>
                </a>

                <a href="https://careerforge.pro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Corporate</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">careerforge.pro</div>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form (Right) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for reaching out! (This is a frontend placeholder)');
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 p-8 space-y-5 h-full"
            >
              <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 mb-4">Send a Message</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="How can we help?"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Tell us everything..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100 resize-none h-32"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 mt-2 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-indigo-600 dark:bg-indigo-900 border-t border-indigo-500/30 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight">
            Ready to upgrade your career?
          </h2>
          <p className="text-indigo-100 text-sm md:text-base max-w-xl mx-auto">
            Join thousands of professionals securing interviews 10x faster with AI-optimized ATS targeting.
          </p>
          <div className="pt-2">
            <Link 
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              Start Building Your Resume <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
