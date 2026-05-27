import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FileText, 
  Award, 
  Globe, 
  FolderGit2, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ExternalLink,
  Laptop
} from 'lucide-react';

const Builder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentResume, 
    loadResumeById, 
    updateResumeLocal, 
    saveResumeImmediately, 
    saving, 
    loading, 
    error 
  } = useResumeStore();

  const [activeAccordion, setActiveAccordion] = useState('personal');
  const [saveStatus, setSaveStatus] = useState('Saved to cloud');

  // Load the specific resume on mount
  useEffect(() => {
    loadResumeById(id);
  }, [id, loadResumeById]);

  // Sync visual saving feedback
  useEffect(() => {
    if (saving) {
      setSaveStatus('Saving changes...');
    } else {
      setSaveStatus('All changes saved');
    }
  }, [saving]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-lg">Forging your editing studio...</p>
      </div>
    );
  }

  if (error && !currentResume) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Failed to Load Resume</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2">{error}</p>
        <Link to="/dashboard" className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!currentResume) return null;

  // Destructure resume sections with fallbacks
  const {
    title = '',
    templateId = 'modern',
    sectionOrder = [],
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    certifications = [],
    projects = [],
    languages = [],
    atsMetadata = { score: 50, feedback: [] }
  } = currentResume;

  // Local state update helpers
  const handlePersonalInfoChange = (field, value) => {
    updateResumeLocal({
      personalInfo: {
        ...personalInfo,
        [field]: value
      }
    });
  };

  const handleSummaryChange = (value) => {
    updateResumeLocal({ summary: value });
  };

  // Experience CRUD
  const handleAddExperience = () => {
    const newItem = { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    updateResumeLocal({ experience: [...experience, newItem] });
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ experience: updated });
  };

  const handleRemoveExperience = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    updateResumeLocal({ experience: updated });
  };

  // Education CRUD
  const handleAddEducation = () => {
    const newItem = { school: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    updateResumeLocal({ education: [...education, newItem] });
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ education: updated });
  };

  const handleRemoveEducation = (index) => {
    const updated = education.filter((_, i) => i !== index);
    updateResumeLocal({ education: updated });
  };

  // Skills CRUD (categorized skills with comma-separated inputs)
  const handleAddSkillCategory = () => {
    const newItem = { name: '', level: '', keywords: [] };
    updateResumeLocal({ skills: [...skills, newItem] });
  };

  const handleUpdateSkillCategory = (index, field, value) => {
    const updated = [...skills];
    if (field === 'keywords') {
      // Split comma separated list into string array
      const arr = value.split(',').map(s => s.trim()).filter(s => s !== '');
      updated[index] = { ...updated[index], keywords: arr };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    updateResumeLocal({ skills: updated });
  };

  const handleRemoveSkillCategory = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    updateResumeLocal({ skills: updated });
  };

  // Projects CRUD
  const handleAddProject = () => {
    const newItem = { title: '', role: '', startDate: '', endDate: '', url: '', description: '' };
    updateResumeLocal({ projects: [...projects, newItem] });
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ projects: updated });
  };

  const handleRemoveProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    updateResumeLocal({ projects: updated });
  };

  // Certifications CRUD
  const handleAddCertification = () => {
    const newItem = { name: '', issuer: '', date: '', url: '' };
    updateResumeLocal({ certifications: [...certifications, newItem] });
  };

  const handleUpdateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ certifications: updated });
  };

  const handleRemoveCertification = (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    updateResumeLocal({ certifications: updated });
  };

  // Languages CRUD
  const handleAddLanguage = () => {
    const newItem = { language: '', proficiency: '' };
    updateResumeLocal({ languages: [...languages, newItem] });
  };

  const handleUpdateLanguage = (index, field, value) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeLocal({ languages: updated });
  };

  const handleRemoveLanguage = (index) => {
    const updated = languages.filter((_, i) => i !== index);
    updateResumeLocal({ languages: updated });
  };

  // Section Ordering actions
  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Swap items
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    updateResumeLocal({ sectionOrder: newOrder });
  };

  // Toggle accordions helper
  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? '' : name);
  };

  // Immediate save trigger
  const handleForceSave = async () => {
    setSaveStatus('Saving immediately...');
    const ok = await saveResumeImmediately();
    if (ok) {
      setSaveStatus('All changes saved');
    } else {
      setSaveStatus('Save error. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top action header banner */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            onClick={saveResumeImmediately}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-left">
            <input
              type="text"
              value={title}
              onChange={(e) => updateResumeLocal({ title: e.target.value })}
              className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 font-bold font-display text-slate-800 dark:text-slate-100 text-lg focus:outline-none px-1 py-0.5 rounded transition-all"
            />
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span>Status:</span>
              <span className={`font-semibold ${saving ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-500'}`}>
                {saveStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          {/* Template Select Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Theme:</span>
            <select
              value={templateId}
              onChange={(e) => updateResumeLocal({ templateId: e.target.value })}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="modern">Modern (Accent)</option>
              <option value="classic">Classic (Traditional)</option>
              <option value="minimalist">Minimalist (Clean)</option>
            </select>
          </div>

          <button
            onClick={handleForceSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Now</span>
          </button>
        </div>
      </header>

      {/* Editor Split-Screen Layout Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT WORKSPACE: Input Accordion Editor Panel */}
        <div className="w-full md:w-[48%] lg:w-[45%] border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto p-5 space-y-6 bg-slate-50 dark:bg-slate-950/20 text-left">
          
          {/* Real-time ATS Feedback Mini Card */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm ${
              atsMetadata.score >= 70 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
            }`}>
              {atsMetadata.score}%
            </div>
            <div className="space-y-1 overflow-hidden">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                ATS Optimizer Check
              </h4>
              {atsMetadata.feedback && atsMetadata.feedback.length > 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed truncate">
                  💡 {atsMetadata.feedback[0]}
                </p>
              ) : (
                <p className="text-xs text-emerald-500">Perfect layout structural parsed!</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. PERSONAL INFORMATION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('personal')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span>Personal Details</span>
                </div>
                {activeAccordion === 'personal' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'personal' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={personalInfo.fullName || ''}
                            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            value={personalInfo.email || ''}
                            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                          <input
                            type="text"
                            placeholder="+1 (555) 000-0000"
                            value={personalInfo.phone || ''}
                            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                          <input
                            type="text"
                            placeholder="San Francisco, CA"
                            value={personalInfo.location || ''}
                            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Links & Portfolios</h5>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">Website</label>
                            <input
                              type="text"
                              placeholder="portfolio.com"
                              value={personalInfo.website || ''}
                              onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">GitHub</label>
                            <input
                              type="text"
                              placeholder="github.com/user"
                              value={personalInfo.github || ''}
                              onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">LinkedIn</label>
                            <input
                              type="text"
                              placeholder="linkedin.com/in/user"
                              value={personalInfo.linkedin || ''}
                              onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. PROFESSIONAL SUMMARY */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('summary')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Professional Summary</span>
                </div>
                {activeAccordion === 'summary' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'summary' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Bio</label>
                      <textarea
                        rows={4}
                        placeholder="Write a compelling, core target profile summarizing your experience and top skills..."
                        value={summary}
                        onChange={(e) => handleSummaryChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. WORK EXPERIENCE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('experience')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <span>Experience ({experience.length})</span>
                </div>
                {activeAccordion === 'experience' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'experience' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {experience.map((exp, idx) => (
                        <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveExperience(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Position #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Company</label>
                              <input
                                type="text"
                                placeholder="Google"
                                value={exp.company}
                                onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Role Title</label>
                              <input
                                type="text"
                                placeholder="Senior Engineer"
                                value={exp.position}
                                onChange={(e) => handleUpdateExperience(idx, 'position', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Location</label>
                              <input
                                type="text"
                                placeholder="Remote"
                                value={exp.location}
                                onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Start Date</label>
                              <input
                                type="text"
                                placeholder="Jan 2024"
                                value={exp.startDate}
                                onChange={(e) => handleUpdateExperience(idx, 'startDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">End Date</label>
                              <input
                                type="text"
                                placeholder="Present"
                                disabled={exp.current}
                                value={exp.current ? 'Present' : exp.endDate}
                                onChange={(e) => handleUpdateExperience(idx, 'endDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none disabled:opacity-55"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`current-${idx}`}
                              checked={exp.current}
                              onChange={(e) => handleUpdateExperience(idx, 'current', e.target.checked)}
                              className="w-3.5 h-3.5 text-indigo-600 bg-white dark:bg-slate-900 border-slate-200 rounded"
                            />
                            <label htmlFor={`current-${idx}`} className="text-[10px] font-bold text-slate-500">I currently work here</label>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">Impact & Responsibilities (Bulleted)</label>
                            <textarea
                              rows={3}
                              placeholder="- Implemented scalable Node APIs boosting throughput by 30%&#10;- Led team of 4 engineers..."
                              value={exp.description}
                              onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Experience
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. EDUCATION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('education')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>Education ({education.length})</span>
                </div>
                {activeAccordion === 'education' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'education' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {education.map((edu, idx) => (
                        <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveEducation(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">School #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">School/University</label>
                              <input
                                type="text"
                                placeholder="Stanford"
                                value={edu.school}
                                onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Degree & Major</label>
                              <input
                                type="text"
                                placeholder="B.S. Computer Science"
                                value={edu.degree}
                                onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Location</label>
                              <input
                                type="text"
                                placeholder="Stanford, CA"
                                value={edu.location}
                                onChange={(e) => handleUpdateEducation(idx, 'location', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Start Year</label>
                              <input
                                type="text"
                                placeholder="2020"
                                value={edu.startDate}
                                onChange={(e) => handleUpdateEducation(idx, 'startDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">End Year</label>
                              <input
                                type="text"
                                placeholder="2024"
                                value={edu.endDate}
                                onChange={(e) => handleUpdateEducation(idx, 'endDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Education
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5. TECHNICAL SKILLS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('skills')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-indigo-500" />
                  <span>Skills ({skills.length})</span>
                </div>
                {activeAccordion === 'skills' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'skills' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveSkillCategory(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Skill Group #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Group Name</label>
                              <input
                                type="text"
                                placeholder="Languages"
                                value={skill.name}
                                onChange={(e) => handleUpdateSkillCategory(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Proficiency Level (Optional)</label>
                              <input
                                type="text"
                                placeholder="Expert"
                                value={skill.level}
                                onChange={(e) => handleUpdateSkillCategory(idx, 'level', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">Keywords (Comma Separated)</label>
                            <input
                              type="text"
                              placeholder="React, JavaScript, HTML, CSS"
                              value={skill.keywords ? skill.keywords.join(', ') : ''}
                              onChange={(e) => handleUpdateSkillCategory(idx, 'keywords', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            />
                            <p className="text-[9px] text-slate-400">Separate keywords with commas. Essential for ATS matching filters.</p>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddSkillCategory}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Skill Group
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. PROJECTS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('projects')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-4 h-4 text-indigo-500" />
                  <span>Projects ({projects.length})</span>
                </div>
                {activeAccordion === 'projects' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'projects' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {projects.map((proj, idx) => (
                        <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveProject(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Project #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Project Name</label>
                              <input
                                type="text"
                                placeholder="E-Commerce API"
                                value={proj.title}
                                onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Role/Scope</label>
                              <input
                                type="text"
                                placeholder="Solo Creator"
                                value={proj.role}
                                onChange={(e) => handleUpdateProject(idx, 'role', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1 col-span-2">
                              <label className="text-[9px] font-bold text-slate-400">Project URL</label>
                              <input
                                type="text"
                                placeholder="github.com/my-project"
                                value={proj.url}
                                onChange={(e) => handleUpdateProject(idx, 'url', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Date</label>
                              <input
                                type="text"
                                placeholder="2025"
                                value={proj.startDate}
                                onChange={(e) => handleUpdateProject(idx, 'startDate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400">Project Description</label>
                            <textarea
                              rows={2.5}
                              placeholder="Built scalable auth pipelines utilizing Redis cache layer..."
                              value={proj.description}
                              onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddProject}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Project
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 7. CERTIFICATIONS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('certifications')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Certifications ({certifications.length})</span>
                </div>
                {activeAccordion === 'certifications' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'certifications' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveCertification(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Certification #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Name</label>
                              <input
                                type="text"
                                placeholder="AWS Solutions Architect"
                                value={cert.name}
                                onChange={(e) => handleUpdateCertification(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Issuer</label>
                              <input
                                type="text"
                                placeholder="Amazon Web Services"
                                value={cert.issuer}
                                onChange={(e) => handleUpdateCertification(idx, 'issuer', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1 col-span-2">
                              <label className="text-[9px] font-bold text-slate-400">Certificate URL</label>
                              <input
                                type="text"
                                placeholder="aws.cert.com/id"
                                value={cert.url}
                                onChange={(e) => handleUpdateCertification(idx, 'url', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Issue Date</label>
                              <input
                                type="text"
                                placeholder="Jun 2025"
                                value={cert.date}
                                onChange={(e) => handleUpdateCertification(idx, 'date', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddCertification}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Certification
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 8. LANGUAGES */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('languages')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>Languages ({languages.length})</span>
                </div>
                {activeAccordion === 'languages' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'languages' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-6">
                      {languages.map((lang, idx) => (
                        <div key={idx} className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl relative border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRemoveLanguage(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h6 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Language #{idx + 1}</h6>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Language</label>
                              <input
                                type="text"
                                placeholder="Spanish"
                                value={lang.language}
                                onChange={(e) => handleUpdateLanguage(idx, 'language', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400">Proficiency</label>
                              <input
                                type="text"
                                placeholder="Native / Professional"
                                value={lang.proficiency}
                                onChange={(e) => handleUpdateLanguage(idx, 'proficiency', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddLanguage}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Language
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 9. SECTION SORTING AND LAYOUT STRUCTURE WIDGET */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('layout')}
                className="w-full px-5 py-4 flex items-center justify-between font-bold font-display text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Laptop className="w-4 h-4 text-indigo-500" />
                  <span>Section Layout Ordering</span>
                </div>
                {activeAccordion === 'layout' ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {activeAccordion === 'layout' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="p-5 space-y-3 text-left">
                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                        Drag or sort sections to adjust layout hierarchy. Recalculates resume structure in real-time.
                      </p>
                      
                      <div className="space-y-1.5">
                        {sectionOrder.map((sectionName, idx) => (
                          <div 
                            key={sectionName} 
                            className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl"
                          >
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{sectionName}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSection(idx, -1)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === sectionOrder.length - 1}
                                onClick={() => moveSection(idx, 1)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* RIGHT WORKSPACE: Real-time Live Resume Preview Panel */}
        <div className="flex-1 bg-slate-200/50 dark:bg-slate-900/30 overflow-y-auto p-6 md:p-8 flex justify-center">
          
          {/* Main Visual Render Page sheet standard */}
          <div className="w-full max-w-[800px] min-h-[1056px] bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-xl border border-slate-300/40 dark:border-slate-800/80 rounded-lg p-8 md:p-12 flex flex-col justify-between text-left relative overflow-hidden transition-all duration-300">
            
            {/* Header branding overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500" />
            
            <div>
              {/* Dynamic Header Section (Personal details) based on templateId */}
              <header className={`pb-6 border-b ${
                templateId === 'classic' ? 'text-center border-slate-300' : 'flex flex-col sm:flex-row justify-between sm:items-end border-slate-200/50 dark:border-slate-800'
              }`}>
                <div>
                  <h1 className={`font-display font-extrabold tracking-tight text-slate-900 dark:text-slate-100 ${
                    templateId === 'classic' ? 'text-3xl' : 'text-2xl sm:text-3xl'
                  }`}>
                    {personalInfo.fullName || 'YOUR FULL NAME'}
                  </h1>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wide">
                    {experience[0]?.position || 'Target Professional Role'}
                  </p>
                </div>
                
                <div className={`text-xs text-slate-500 dark:text-slate-400 space-y-1 ${
                  templateId === 'classic' ? 'flex flex-wrap items-center justify-center gap-x-4 mt-3 border-t pt-2 border-slate-100 dark:border-slate-900' : 'mt-4 sm:mt-0 sm:text-right'
                }`}>
                  <p>{personalInfo.email || 'email@address.com'}</p>
                  <p>{personalInfo.phone || '+1 (555) 000-0000'}</p>
                  <p>{personalInfo.location || 'Location Area, State'}</p>
                  <div className={`flex gap-3 justify-start sm:justify-end ${templateId === 'classic' ? 'w-full justify-center' : ''}`}>
                    {personalInfo.website && <span className="hover:underline text-[10px]">{personalInfo.website}</span>}
                    {personalInfo.github && <span className="hover:underline text-[10px]">{personalInfo.github}</span>}
                    {personalInfo.linkedin && <span className="hover:underline text-[10px]">{personalInfo.linkedin}</span>}
                  </div>
                </div>
              </header>

              {/* Dynamic Render Loop of active sections based on sectionOrder */}
              <div className="pt-6 space-y-6">
                {sectionOrder.map((sectionName) => {
                  
                  // Summary Section
                  if (sectionName === 'summary' && summary) {
                    return (
                      <section key="summary" className="space-y-2">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Professional Summary
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                          {summary}
                        </p>
                      </section>
                    );
                  }

                  // Work Experience Section
                  if (sectionName === 'experience' && experience.length > 0) {
                    return (
                      <section key="experience" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Professional Experience
                        </h2>
                        <div className="space-y-4">
                          {experience.map((exp, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{exp.position || 'Position Title'}</span>
                                  <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span>
                                  <span className="font-semibold text-slate-600 dark:text-slate-400">{exp.company || 'Company'}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {exp.startDate || 'Date'} — {exp.current ? 'Present' : exp.endDate || 'Date'}
                                </span>
                              </div>
                              {exp.location && <p className="text-[10px] text-slate-400">{exp.location}</p>}
                              {exp.description && (
                                <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 font-sans">
                                  {exp.description.split('\n').map((bullet, bIdx) => (
                                    <li key={bIdx}>{bullet.replace(/^- /, '')}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Education Section
                  if (sectionName === 'education' && education.length > 0) {
                    return (
                      <section key="education" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Education
                        </h2>
                        <div className="space-y-3">
                          {education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-start text-xs">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{edu.degree || 'Degree Major'}</span>
                                <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span>
                                <span className="font-semibold text-slate-600 dark:text-slate-400">{edu.school || 'School'}</span>
                                {edu.location && <span className="text-[10px] text-slate-400 ml-2">({edu.location})</span>}
                              </div>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {edu.startDate || 'Date'} — {edu.endDate || 'Date'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Technical Skills Section
                  if (sectionName === 'skills' && skills.length > 0) {
                    return (
                      <section key="skills" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Skills
                        </h2>
                        <div className="space-y-2 text-xs">
                          {skills.map((skill, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1.5">
                              <span className="sm:col-span-3 font-bold text-slate-700 dark:text-slate-300 capitalize">{skill.name || 'Group'}:</span>
                              <div className="sm:col-span-9 flex flex-wrap gap-x-1.5 gap-y-1">
                                {skill.keywords && skill.keywords.map((kw, kwIdx) => (
                                  <span key={kwIdx} className="text-slate-600 dark:text-slate-400">
                                    {kw}{kwIdx < skill.keywords.length - 1 ? ',' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Projects Section
                  if (sectionName === 'projects' && projects.length > 0) {
                    return (
                      <section key="projects" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Projects
                        </h2>
                        <div className="space-y-3">
                          {projects.map((proj, idx) => (
                            <div key={idx} className="space-y-1 text-xs">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{proj.title || 'Project Title'}</span>
                                  {proj.role && <span className="text-[10px] text-slate-400">({proj.role})</span>}
                                  {proj.url && (
                                    <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400">{proj.startDate}</span>
                              </div>
                              {proj.description && <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{proj.description}</p>}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Certifications Section
                  if (sectionName === 'certifications' && certifications.length > 0) {
                    return (
                      <section key="certifications" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Certifications
                        </h2>
                        <div className="space-y-2 text-xs">
                          {certifications.map((cert, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{cert.name || 'Certification Name'}</span>
                                <span className="text-slate-400 mx-1.5">—</span>
                                <span className="text-slate-600 dark:text-slate-400">{cert.issuer}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{cert.date}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  // Languages Section
                  if (sectionName === 'languages' && languages.length > 0) {
                    return (
                      <section key="languages" className="space-y-3">
                        <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900/50 pb-1">
                          Languages
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                          {languages.map((lang, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{lang.language}</span>
                              {lang.proficiency && <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 border px-1.5 py-0.5 rounded">({lang.proficiency})</span>}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  return null;
                })}
              </div>
            </div>

            {/* Resume Page Footer info */}
            <footer className="pt-8 border-t border-slate-100 dark:border-slate-900/80 text-[9px] text-slate-300 text-center uppercase tracking-widest font-mono">
              Generated by CareerForge Pro ATS Builder
            </footer>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Builder;
