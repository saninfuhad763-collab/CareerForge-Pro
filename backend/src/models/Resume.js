import mongoose from 'mongoose';

const personalInfoSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' }, // Supporting bulleted descriptions
});

const educationSchema = new mongoose.Schema({
  school: { type: String, default: '' },
  degree: { type: String, default: '' },
  fieldOfStudy: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
});

const skillSchema = new mongoose.Schema({
  name: { type: String, default: '' },       // E.g. "Languages" or "Frontend"
  level: { type: String, default: '' },      // E.g. "Expert", "Proficient" (optional)
  keywords: [{ type: String }],              // E.g. ["React", "JavaScript", "HTML"]
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  issuer: { type: String, default: '' },
  date: { type: String, default: '' },
  url: { type: String, default: '' },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  role: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  url: { type: String, default: '' },
  description: { type: String, default: '' },
});

const languageSchema = new mongoose.Schema({
  language: { type: String, default: '' },
  proficiency: { type: String, default: '' }, // E.g. "Native", "Fluent", "Conversational"
});

const customSectionItemSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
});

const customSectionSchema = new mongoose.Schema({
  id: { type: String, required: true },       // Unique custom section identifier
  title: { type: String, default: 'Custom Section' },
  items: [customSectionItemSchema],
});

const atsMetadataSchema = new mongoose.Schema({
  score: { type: Number, default: 0 },
  keywordsFound: [{ type: String }],
  keywordsMissing: [{ type: String }],
  feedback: [{ type: String }],
}, { _id: false });

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a resume title'],
      trim: true,
      default: 'My Professional Resume',
    },
    templateId: {
      type: String,
      required: true,
      default: 'modern', // 'modern', 'classic', 'minimalist'
    },
    sectionOrder: {
      type: [String],
      default: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'custom'],
    },
    personalInfo: {
      type: personalInfoSchema,
      default: () => ({}),
    },
    summary: {
      type: String,
      default: '',
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    certifications: [certificationSchema],
    projects: [projectSchema],
    languages: [languageSchema],
    customSections: [customSectionSchema],
    atsMetadata: {
      type: atsMetadataSchema,
      default: () => ({ score: 70 }), // Initial default baseline score
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
