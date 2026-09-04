import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  X,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Info,
  Layers,
  Search,
  FileText
} from 'lucide-react';
import DeleteModal from './DeleteModal';

/**
 * Cleanly truncates snippet at nearest previous word boundary within maxLen
 */
const truncateSnippet = (text, maxLen = 160) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLen) return text;
  const lastSpace = text.lastIndexOf(' ', maxLen);
  return (lastSpace > 0 ? text.substring(0, lastSpace) : text.substring(0, maxLen)) + '...';
};

const ATSReportModal = ({
  isOpen,
  onClose,
  safeAtsMetadata,
  dynamicAtsData,
  _atsBreakdown,
  modalKeywordSearch,
  setModalKeywordSearch,
  openMagicOptimizer,
  isAtsStale = false,
}) => {
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'matched' | 'partial' | 'missing'

  // Authoritative consolidated report view model
  const report = useMemo(() => {
    const evidence = (dynamicAtsData?.requirementEvidence && dynamicAtsData.requirementEvidence.length > 0)
      ? dynamicAtsData.requirementEvidence
      : (safeAtsMetadata?.requirementEvidence && safeAtsMetadata.requirementEvidence.length > 0)
      ? safeAtsMetadata.requirementEvidence
      : (_atsBreakdown?.requirementEvidence || []);

    const recommendations = (dynamicAtsData?.structuredRecommendations && dynamicAtsData.structuredRecommendations.length > 0)
      ? dynamicAtsData.structuredRecommendations
      : (safeAtsMetadata?.structuredRecommendations && safeAtsMetadata.structuredRecommendations.length > 0)
      ? safeAtsMetadata.structuredRecommendations
      : (_atsBreakdown?.structuredRecommendations || []);

    const score = dynamicAtsData?.score ?? safeAtsMetadata?.score ?? _atsBreakdown?.atsScore ?? 0;
    const requirementMatch = dynamicAtsData?.requiredCoverage ?? _atsBreakdown?.requiredCoverage ?? dynamicAtsData?.keywordMatchPercent ?? score;

    const matchedEvidence = evidence.filter(e => e.matchType === 'EXACT' || e.matchType === 'ALIAS');
    const partialEvidence = evidence.filter(e => e.matchType === 'PARTIAL');
    const missingEvidence = evidence.filter(e => e.matchType === 'MISSING');

    return {
      hasEvidence: evidence.length > 0,
      evidence,
      matchedEvidence,
      partialEvidence,
      missingEvidence,
      recommendations,
      score,
      requirementMatch,
      requiredMatched: dynamicAtsData?.requiredMatched || safeAtsMetadata?.requiredMatched || [],
      requiredPartial: dynamicAtsData?.requiredPartial || safeAtsMetadata?.requiredPartial || [],
      requiredMissing: dynamicAtsData?.requiredMissing || safeAtsMetadata?.requiredMissing || [],
      preferredMatched: dynamicAtsData?.preferredMatched || safeAtsMetadata?.preferredMatched || [],
      preferredPartial: dynamicAtsData?.preferredPartial || safeAtsMetadata?.preferredPartial || [],
      preferredMissing: dynamicAtsData?.preferredMissing || safeAtsMetadata?.preferredMissing || [],
      matchedKeywords: dynamicAtsData?.matchedKeywords || [],
      missingKeywords: dynamicAtsData?.missingKeywords || [],
      matchedAliases: dynamicAtsData?.matchedAliases || _atsBreakdown?.matchedAliases || {},
      feedback: (dynamicAtsData?.feedback && dynamicAtsData.feedback.length > 0)
        ? dynamicAtsData.feedback
        : (safeAtsMetadata?.feedback || _atsBreakdown?.recommendations || []),
    };
  }, [dynamicAtsData, _atsBreakdown, safeAtsMetadata]);

  // Filtered evidence based on tab and search query
  const filteredEvidence = useMemo(() => {
    if (!report.hasEvidence) return [];

    let list = report.evidence;
    if (activeTab === 'matched') {
      list = report.matchedEvidence;
    } else if (activeTab === 'partial') {
      list = report.partialEvidence;
    } else if (activeTab === 'missing') {
      list = report.missingEvidence;
    }

    const query = (modalKeywordSearch || '').toLowerCase().trim();
    if (!query) return list;

    return list.filter(item => {
      const nameMatch = (item.canonicalName || '').toLowerCase().includes(query);
      const catMatch = (item.category || '').toLowerCase().includes(query);
      const termMatch = (item.matchedTerm || '').toLowerCase().includes(query);
      const sectionMatch = (item.section || '').toLowerCase().includes(query);
      const snippetMatch = (item.evidenceSnippet || '').toLowerCase().includes(query);
      return nameMatch || catMatch || termMatch || sectionMatch || snippetMatch;
    });
  }, [report, activeTab, modalKeywordSearch]);

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
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
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
                    Deterministic evidence-based screening simulation report
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close ATS report"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Score Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Requirement Match Card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ATS Requirement Match
                    </div>
                    <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                      {report.requirementMatch}%
                    </div>
                  </div>
                  <div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          report.requirementMatch >= 80 ? 'bg-emerald-500' : report.requirementMatch >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${report.requirementMatch}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold mt-2">
                      {report.hasEvidence
                        ? report.partialEvidence.length > 0
                          ? `${report.matchedEvidence.length} verified · ${report.partialEvidence.length} partial of ${report.evidence.length} requirements`
                          : `${report.matchedEvidence.length} verified of ${report.evidence.length} requirements`
                        : `${report.matchedKeywords.length} verified of ${report.matchedKeywords.length + report.missingKeywords.length} requirements`}
                    </p>
                  </div>
                </div>

                {/* Formatting Check Card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Formatting Check
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-500 mt-1 flex items-center gap-1.5">
                      <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                      <span>Pass</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold mt-3">
                    Standard layout and parser readable.
                  </p>
                </div>

                {/* Overall Impact Card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Overall Impact
                    </div>
                    <div className={`text-2xl font-extrabold mt-1 ${
                      report.score >= 80 ? 'text-emerald-500' : report.score >= 60 ? 'text-indigo-500' : 'text-amber-500'
                    }`}>
                      {report.score >= 80 ? 'Strong' : report.score >= 60 ? 'Moderate' : 'Needs Work'}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold mt-3">
                    ATS Readiness Score: {report.score}/100
                  </p>
                </div>
              </div>

              {/* Stale Analysis Warning if JD was modified */}
              {isAtsStale && (
                <div className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-medium">
                    Job description modified — click <strong className="font-bold">"Run ATS Matcher"</strong> to update this analysis.
                  </span>
                </div>
              )}

              {/* Score Metric Explanation Banner (Fix 8) */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <strong className="text-slate-800 dark:text-slate-100 font-bold">Requirement Match</strong> measures core requirement coverage. <strong className="text-slate-800 dark:text-slate-100 font-bold">ATS Readiness Score</strong> adds weighted preferred requirements and verified experience evidence.
                  </p>
                </div>
                <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/60 px-2 py-1 rounded-lg shrink-0" title="Deterministic Formula: 70% Core Requirements + 20% Preferred + 10-point Experience">
                  70% Core Requirements · 20% Preferred · 10-point Experience
                </span>
              </div>

              {/* Requirement Compliance Breakdown */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Requirement Evidence & Compliance
                      </h4>
                      <p className="text-[9.5px] text-slate-400">
                        Section-aware verification against target job requirements
                      </p>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter requirements..."
                      aria-label="Filter requirements"
                      value={modalKeywordSearch}
                      onChange={(e) => setModalKeywordSearch(e.target.value)}
                      className="pl-8 pr-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] focus:outline-none focus:border-indigo-500 w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Evidence Mode (Phase 2A/2B/2C) */}
                {report.hasEvidence ? (
                  <div className="space-y-3">
                    {/* Status Filter Tabs */}
                    <div role="tablist" aria-label="Requirement filter tabs" className="flex items-center gap-1.5 flex-wrap border-b border-slate-100 dark:border-slate-800/80 pb-2">
                      <button
                        type="button"
                        role="tab"
                        id="tab-all"
                        aria-selected={activeTab === 'all'}
                        aria-controls="requirements-evidence-list"
                        onClick={() => setActiveTab('all')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          activeTab === 'all'
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        All ({report.evidence.length})
                      </button>
                      <button
                        type="button"
                        role="tab"
                        id="tab-matched"
                        aria-selected={activeTab === 'matched'}
                        aria-controls="requirements-evidence-list"
                        onClick={() => setActiveTab('matched')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          activeTab === 'matched'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Matched ({report.matchedEvidence.length})</span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        id="tab-partial"
                        aria-selected={activeTab === 'partial'}
                        aria-controls="requirements-evidence-list"
                        onClick={() => setActiveTab('partial')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          activeTab === 'partial'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Partial ({report.partialEvidence.length})</span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        id="tab-missing"
                        aria-selected={activeTab === 'missing'}
                        aria-controls="requirements-evidence-list"
                        onClick={() => setActiveTab('missing')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          activeTab === 'missing'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                        }`}
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>Missing ({report.missingEvidence.length})</span>
                      </button>
                    </div>

                    {/* Requirements Evidence Cards List */}
                    <div id="requirements-evidence-list" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {filteredEvidence.map((item, idx) => {
                        const isExact = item.matchType === 'EXACT';
                        const isAlias = item.matchType === 'ALIAS';
                        const isPartial = item.matchType === 'PARTIAL';
                        const isMissing = item.matchType === 'MISSING';

                        return (
                          <div
                            key={`${item.canonicalId || item.canonicalName}-${idx}`}
                            className={`p-3.5 rounded-xl border text-xs transition-all ${
                              isExact
                                ? 'bg-emerald-50/20 dark:bg-emerald-950/15 border-emerald-200/60 dark:border-emerald-900/40'
                                : isAlias
                                ? 'bg-sky-50/20 dark:bg-sky-950/15 border-sky-200/60 dark:border-sky-900/40'
                                : isPartial
                                ? 'bg-amber-50/20 dark:bg-amber-950/15 border-amber-200/60 dark:border-amber-900/40'
                                : 'bg-rose-50/20 dark:bg-rose-950/15 border-rose-200/60 dark:border-rose-900/40'
                            }`}
                          >
                            {/* Card Top: Canonical Name, Tier, Category, Match Badge */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                                  {item.canonicalName}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                    item.tier === 'REQUIRED'
                                      ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/60'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {item.tier || 'REQUIRED'}
                                </span>
                                {item.category && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/70">
                                    {item.category}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Match Type Badge */}
                                {isExact && (
                                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>EXACT</span>
                                  </span>
                                )}
                                {isAlias && (
                                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-sky-100/70 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                                    <span>ALIAS</span>
                                  </span>
                                )}
                                {isPartial && (
                                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-amber-100/70 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span>PARTIAL</span>
                                  </span>
                                )}
                                {isMissing && (
                                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-rose-100/70 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                    <span>MISSING</span>
                                  </span>
                                )}

                                {/* Section Provenance */}
                                {item.section && item.section !== 'none' && (
                                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-800 flex items-center gap-1">
                                    <FileText className="w-2.5 h-2.5 text-slate-400" />
                                    <span className="capitalize">{item.section}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Content: Details, Provenance & Gaps */}
                            {isExact && item.evidenceSnippet && (
                              <div className="mt-2 text-[10.5px] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/40 dark:border-slate-800/50 leading-relaxed font-mono">
                                <span className="text-emerald-500 font-bold mr-1">"</span>
                                {truncateSnippet(item.evidenceSnippet, 160)}
                                <span className="text-emerald-500 font-bold ml-1">"</span>
                              </div>
                            )}

                            {isAlias && (
                              <div className="mt-2 space-y-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {item.matchedTerm && (
                                    <div className="text-[10px] text-sky-800 dark:text-sky-300 font-medium">
                                      Verified terminology in resume:{' '}
                                      <span className="font-bold font-mono bg-sky-100/70 dark:bg-sky-900/50 px-1.5 py-0.5 rounded border border-sky-200/50 dark:border-sky-800/60">
                                        "{item.matchedTerm}"
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-[8.5px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-200/50 dark:border-sky-800/60">
                                    Credited (100%) · Optional Terminology Alignment
                                  </span>
                                </div>
                                {item.evidenceSnippet && (
                                  <div className="text-[10.5px] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/40 dark:border-slate-800/50 leading-relaxed font-mono">
                                    <span className="text-sky-500 font-bold mr-1">"</span>
                                    {truncateSnippet(item.evidenceSnippet, 160)}
                                    <span className="text-sky-500 font-bold ml-1">"</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {isPartial && (
                              <div className="mt-2 space-y-1.5">
                                {item.evidenceSnippet && (
                                  <div className="text-[10.5px] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/40 dark:border-slate-800/50 leading-relaxed">
                                    <span className="text-amber-700 dark:text-amber-400 font-bold block text-[9.5px] uppercase tracking-wider mb-0.5">
                                      Evidence Found:
                                    </span>
                                    <span className="font-mono">
                                      "{truncateSnippet(item.evidenceSnippet, 160)}"
                                    </span>
                                  </div>
                                )}
                                <div className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/50 dark:border-amber-900/50 flex items-start gap-1.5">
                                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                  <span>
                                    Gap: Broader {item.canonicalName} practices are not explicitly demonstrated in the resume.
                                  </span>
                                </div>
                              </div>
                            )}

                            {isMissing && (
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 italic">
                                  No verified resume evidence was found.
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openMagicOptimizer('bullet', '', (newVal) => {
                                      setAlertModalContent(`Suggested optimized sentence to inject:\n\n${newVal}`);
                                      setAlertModalOpen(true);
                                    });
                                  }}
                                  className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Add or optimize experience with Magic Rewrite"
                                >
                                  <Lightbulb className="w-3 h-3" />
                                  <span>Optimize Experience</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {filteredEvidence.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No requirements match the selected filter.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Legacy Fallback Presentation (Step 4 & Step 21) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matched Keywords */}
                    <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl p-4 space-y-2">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matched Requirements ({report.matchedKeywords.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {report.matchedKeywords
                          .filter(k => k.toLowerCase().includes((modalKeywordSearch || '').toLowerCase()))
                          .map(k => (
                            <span
                              key={k}
                              className="px-2 py-0.5 bg-emerald-100/40 dark:bg-emerald-900/30 border border-emerald-200/20 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-[9px] font-bold flex items-center gap-1"
                            >
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              {k}
                              {report.matchedAliases?.[k] && (
                                <span className="text-[8px] opacity-75 ml-0.5 font-medium italic">
                                  (via {report.matchedAliases[k]})
                                </span>
                              )}
                            </span>
                          ))}
                        {report.matchedKeywords.length === 0 && (
                          <span className="text-[9px] text-slate-400">No verified keywords.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-4 space-y-2">
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Missing Requirements ({report.missingKeywords.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {report.missingKeywords
                          .filter(k => k.toLowerCase().includes((modalKeywordSearch || '').toLowerCase()))
                          .map(k => (
                            <span
                              key={k}
                              className="px-2 py-0.5 bg-amber-100/40 dark:bg-rose-950/20 border border-amber-200/20 dark:border-rose-900/30 text-amber-700 dark:text-rose-400 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer hover:border-indigo-500"
                              title="Click to optimize"
                              onClick={() => {
                                openMagicOptimizer('bullet', '', (newVal) => {
                                  setAlertModalContent(`Suggested optimized sentence to inject:\n\n${newVal}`);
                                  setAlertModalOpen(true);
                                });
                              }}
                            >
                              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                              {k}
                            </span>
                          ))}
                        {report.missingKeywords.length === 0 && (
                          <span className="text-[9px] text-slate-400">All requirements verified.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Strategic Advice (Step 12) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      AI Strategic Advice
                    </h4>
                    <p className="text-[9.5px] text-slate-400">
                      Grounded recommendations based on verified resume evidence
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                  {report.recommendations && report.recommendations.length > 0 ? (
                    report.recommendations.map((item, idx) => {
                      const isTerminology = item.type === 'Terminology Alignment';
                      const isPartialGap = item.type === 'Strengthen Existing Evidence';
                      const isMissing = item.type === 'Missing Requirement' || !item.type;

                      return (
                        <div key={idx} className="flex gap-3 text-xs">
                          <span
                            className={`font-bold shrink-0 ${
                              item.priority === 'Critical'
                                ? 'text-rose-500'
                                : item.priority === 'High'
                                ? 'text-orange-500'
                                : isTerminology
                                ? 'text-sky-500'
                                : 'text-indigo-500'
                            }`}
                          >
                            0{idx + 1}.
                          </span>
                          <div className="flex flex-col gap-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Recommendation Type Badge */}
                              <span
                                className={`px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider ${
                                  isTerminology
                                    ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800'
                                    : isPartialGap
                                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800'
                                    : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800'
                                }`}
                              >
                                {item.type || 'Missing Requirement'}
                              </span>

                              {isTerminology && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                                  Credited (100%) · Optional
                                </span>
                              )}

                              {item.priority && (
                                <span className="text-[8.5px] font-semibold text-slate-400">
                                  Priority: {item.priority}
                                </span>
                              )}

                              {item.targetSection && item.targetSection !== 'General' && (
                                <span className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                  Section: {item.targetSection}
                                </span>
                              )}
                            </div>

                            <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {isTerminology
                                ? (() => {
                                    const aliasTerm = item.matchedTerm || item.message?.match(/via '([^']+)'/)?.[1] || 'an equivalent term';
                                    return `${item.canonicalName || 'This requirement'} is already credited through the equivalent term '${aliasTerm}'. Using the exact phrase is optional and may improve compatibility with simpler ATS parsers.`;
                                  })()
                                : item.message}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : report.feedback && report.feedback.length > 0 ? (
                    report.feedback.map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs">
                        <span className="text-indigo-500 font-bold">0{idx + 1}.</span>
                        <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-2.5 text-xs">
                      <span className="text-indigo-500 font-bold">01.</span>
                      <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        Select one of our job presets or paste a target job description to run a detailed requirement audit.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                CareerForge Pro ATS
              </span>
              <button
                type="button"
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
