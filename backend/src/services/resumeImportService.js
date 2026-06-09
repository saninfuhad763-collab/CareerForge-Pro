import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { executeAiChain } from './aiService.js';

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const EMPTY_RESUME_IMPORT = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
};

const asString = (value) => (typeof value === 'string' ? value.trim() : '');
const asBoolean = (value) => (typeof value === 'boolean' ? value : false);
const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizeStringArray = (value) => asArray(value)
  .map((item) => asString(item))
  .filter(Boolean);

const stripJsonFence = (text) => {
  let output = asString(text);
  if (output.startsWith('```')) {
    output = output.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  }
  return output;
};

const getFileExtension = (fileName = '') => {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
};

const isPdf = (file) => file?.mimetype === 'application/pdf' || getFileExtension(file?.originalname) === 'pdf';
const isDocx = (file) => (
  file?.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  || getFileExtension(file?.originalname) === 'docx'
);

export const isSupportedResumeFile = (file) => {
  if (!file) return false;
  return SUPPORTED_MIME_TYPES.has(file.mimetype) || isPdf(file) || isDocx(file);
};

export const extractResumeText = async (file) => {
  if (!file?.buffer || file.buffer.length === 0) {
    throw new Error('Please choose a non-empty PDF or DOCX resume file.');
  }

  if (!isSupportedResumeFile(file)) {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX resume.');
  }

  let text = '';

  if (isPdf(file)) {
    const parsed = await pdfParse(file.buffer);
    text = parsed?.text || '';
  } else if (isDocx(file)) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    text = parsed?.value || '';
  }

  const cleaned = text.replace(/\u0000/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    throw new Error('We could not find readable resume text in that file. Please try another PDF or DOCX.');
  }

  return cleaned;
};

const normalizeImportedResume = (input) => {
  const raw = input && typeof input === 'object' ? input : {};
  const personal = raw.personalInfo && typeof raw.personalInfo === 'object' ? raw.personalInfo : {};

  return {
    personalInfo: {
      ...EMPTY_RESUME_IMPORT.personalInfo,
      fullName: asString(personal.fullName),
      email: asString(personal.email),
      phone: asString(personal.phone),
      location: asString(personal.location),
      website: asString(personal.website),
      github: asString(personal.github),
      linkedin: asString(personal.linkedin),
    },
    summary: asString(raw.summary),
    experience: asArray(raw.experience).map((item) => ({
      company: asString(item?.company),
      position: asString(item?.position),
      location: asString(item?.location),
      startDate: asString(item?.startDate),
      endDate: asString(item?.endDate),
      current: asBoolean(item?.current),
      description: asString(item?.description),
    })),
    education: asArray(raw.education).map((item) => ({
      school: asString(item?.school),
      degree: asString(item?.degree),
      fieldOfStudy: asString(item?.fieldOfStudy),
      location: asString(item?.location),
      startDate: asString(item?.startDate),
      endDate: asString(item?.endDate),
      current: asBoolean(item?.current),
      description: asString(item?.description),
    })),
    skills: asArray(raw.skills).map((item) => ({
      name: asString(item?.name),
      level: asString(item?.level),
      keywords: normalizeStringArray(item?.keywords),
    })),
    certifications: asArray(raw.certifications).map((item) => ({
      name: asString(item?.name),
      issuer: asString(item?.issuer),
      date: asString(item?.date),
      url: asString(item?.url),
    })),
    projects: asArray(raw.projects).map((item) => ({
      title: asString(item?.title),
      role: asString(item?.role),
      startDate: asString(item?.startDate),
      endDate: asString(item?.endDate),
      url: asString(item?.url),
      description: asString(item?.description),
    })),
    languages: asArray(raw.languages).map((item) => ({
      language: asString(item?.language),
      proficiency: asString(item?.proficiency),
    })),
  };
};

export const parseResumeTextToSchema = async (resumeText) => {
  const systemMsg = `You are CareerForge Pro's resume import parser. Convert raw resume text into one strictly valid JSON object and nothing else.

Return exactly this shape:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "website": "", "github": "", "linkedin": "" },
  "summary": "",
  "experience": [{ "company": "", "position": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": "" }],
  "education": [{ "school": "", "degree": "", "fieldOfStudy": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": "" }],
  "skills": [{ "name": "", "level": "", "keywords": [""] }],
  "certifications": [{ "name": "", "issuer": "", "date": "", "url": "" }],
  "projects": [{ "title": "", "role": "", "startDate": "", "endDate": "", "url": "", "description": "" }],
  "languages": [{ "language": "", "proficiency": "" }]
}

Rules:
- Return JSON only. Do not use markdown, comments, prose, or code fences.
- Use only fields from the schema above. Do not add ids or custom sections.
- Use empty strings, false, or empty arrays for missing values.
- Keep descriptions readable and preserve bullet-like accomplishments as newline-separated text where helpful.
- Group skills into logical categories with keywords arrays.`;

  const userMsg = `Resume text to import:\n${resumeText}`;
  const result = await executeAiChain({
    promptType: 'resume_import',
    systemMsg,
    userMsg,
    stream: false,
  });

  try {
    const parsed = JSON.parse(stripJsonFence(result.text));
    return normalizeImportedResume(parsed);
  } catch (error) {
    throw new Error('AI parsing failed. Please try again or upload a cleaner resume file.');
  }
};

export const importResumeFile = async (file) => {
  const text = await extractResumeText(file);
  const resume = await parseResumeTextToSchema(text);
  return { resume, extractedTextLength: text.length };
};
