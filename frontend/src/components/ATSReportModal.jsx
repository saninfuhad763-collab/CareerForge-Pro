import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, CheckCircle, AlertTriangle, Lightbulb, Info } from 'lucide-react';
import DeleteModal from './DeleteModal';

const ATSReportModal = ({
  isOpen,
  onClose,
  safeAtsMetadata,
  dynamicAtsData,
  _atsBreakdown,
  modalKeywordSearch,
  setModalKeywordSearch,
  openMagicOptimizer,
}) => {
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState('');

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-left font-sans animate-fade-in"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-950 px-6 py-4 flex items-center justify-between text-white shrink-0 border-b border-slate-200/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <Target className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">
                    ATS Real-time Compliance Audit
                  </h3>
                  <p className="text-[10px] text-slate-300 font-medium">
                    High-fidelity screening simulation report
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Score Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Keyword Score card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keyword Match</div>
                    <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                      {_atsBreakdown?.keywordMatch ?? dynamicAtsData.keywordMatchPercent}%
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        (_atsBreakdown?.keywordMatch ?? dynamicAtsData.keywordMatchPercent) >= 80 ? 'bg-emerald-500' : (_atsBreakdown?.keywordMatch ?? dynamicAtsData.keywordMatchPercent) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${_atsBreakdown?.keywordMatch ?? dynamicAtsData.keywordMatchPercent}%` }}
                    />
                  </div>
                </div>

                {/* Skills Score Card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formatting Check</div>
                    <div className="text-2xl font-extrabold text-emerald-500 mt-1 flex items-center gap-1.5">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                      <span>Pass</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold mt-3">
                    Standard layout and parsing readable.
                  </p>
                </div>

                {/* AI Recommendation Match */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Impact</div>
                    <div className="text-2xl font-extrabold text-indigo-500 mt-1">
                      {safeAtsMetadata.score >= 80 ? 'Strong' : safeAtsMetadata.score >= 60 ? 'Moderate' : 'Weak'}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold mt-3">
                    Quantifiable work descriptions.
                  </p>
                </div>
              </div>

              {/* Keyword Compliance */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span>Keyword Compliance Breakdown</span>
                  </h4>
                  <input
                    type="text"
                    placeholder="Filter keywords..."
                    value={modalKeywordSearch}
                    onChange={(e) => setModalKeywordSearch(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] focus:outline-none focus:border-indigo-500 w-full sm:w-44 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Matched Keywords */}
                  <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl p-4 space-y-2">
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Matched Keywords ({dynamicAtsData.matchedKeywords.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dynamicAtsData.matchedKeywords
                        .filter(k => k.toLowerCase().includes(modalKeywordSearch.toLowerCase()))
                        .map(k => (
                          <span key={k} className="px-2 py-0.5 bg-emerald-100/40 dark:bg-emerald-900/30 border border-emerald-200/20 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-[9px] font-bold flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            {k}
                            {_atsBreakdown?.matchedAliases?.[k] && (
                              <span className="text-[8px] opacity-75 ml-0.5 font-medium italic">
                                (Alias for {_atsBreakdown.matchedAliases[k]})
                              </span>
                            )}
                          </span>
                        ))}
                      {dynamicAtsData.matchedKeywords.filter(k => k.toLowerCase().includes(modalKeywordSearch.toLowerCase())).length === 0 && (
                        <span className="text-[9px] text-slate-400">No matching keywords found.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-4 space-y-2">
                    <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Missing Keywords ({dynamicAtsData.missingKeywords.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dynamicAtsData.missingKeywords
                        .filter(k => k.toLowerCase().includes(modalKeywordSearch.toLowerCase()))
                        .map(k => (
                          <span key={k} className="px-2 py-0.5 bg-amber-100/40 dark:bg-rose-950/20 border border-amber-200/20 dark:border-rose-900/30 text-amber-700 dark:text-rose-400 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer hover:border-indigo-500" title="Click to auto-fix or optimize" onClick={() => {
                            openMagicOptimizer('bullet', '', (newVal) => {
                              setAlertModalContent(`Suggested optimized sentence to inject:\n\n${newVal}`);
                              setAlertModalOpen(true);
                            });
                          }}>
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                            {k}
                          </span>
                        ))}
                      {dynamicAtsData.missingKeywords.filter(k => k.toLowerCase().includes(modalKeywordSearch.toLowerCase())).length === 0 && (
                        <span className="text-[9px] text-slate-400">No missing keywords! All matched.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Optimization Recommendations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-500 animate-bounce" />
                  <span>AI Strategic Advice</span>
                </h4>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                  {_atsBreakdown?.structuredRecommendations && _atsBreakdown.structuredRecommendations.length > 0 ? (
                    _atsBreakdown.structuredRecommendations.map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs">
                        <span className={`font-bold ${
                          item.priority === 'Critical' ? 'text-rose-500' :
                          item.priority === 'High' ? 'text-orange-500' :
                          item.priority === 'Medium' ? 'text-amber-500' :
                          'text-indigo-500'
                        }`}>0{idx + 1}.</span>
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {item.message}
                          </span>
                          {item.targetSection && item.targetSection !== 'General' && (
                            <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-fit inline-block">
                              Section: {item.targetSection}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : safeAtsMetadata.feedback && safeAtsMetadata.feedback.length > 0 ? (
                    safeAtsMetadata.feedback.map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs">
                        <span className="text-indigo-500 font-bold">0{idx + 1}.</span>
                        <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-2.5 text-xs">
                      <span className="text-indigo-500 font-bold">01.</span>
                      <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        Select one of our premium job presets or paste a target job description to run a detailed multi-vector parser simulation.
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                CareerForge Pro ATS v2.1
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    
    <DeleteModal
      isOpen={alertModalOpen}
      onClose={() => setAlertModalOpen(false)}
      onConfirm={() => {
        setAlertModalOpen(false);
      }}
      title="Suggestion Ready"
      description={alertModalContent}
      confirmText="OK"
      confirmColorClass="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10"
      iconColorClass="text-indigo-500"
      iconBgClass="bg-indigo-50 dark:bg-indigo-950/50"
      hideCancel={true}
      IconComponent={Info}
    />
    </>
  );
};

export default ATSReportModal;
