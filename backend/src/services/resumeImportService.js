import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { executeAiChain } from './aiService.js';

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const EMPTY_RESUME_IMPORT = {
  personalInfo: {
    fullName: '',
    title: '',
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

const sanitizeUrl = (value) => {
  const str = asString(value);
  if (!str) return '';

  // If formatted as markdown link: [Text](URL), extract URL
  const mdMatch = str.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch) return mdMatch[1].trim();

  // If wrapped in parentheses like (https://...), extract URL
  const parenMatch = str.match(/\((https?:\/\/[^\s)]+)\)/i);
  if (parenMatch) return parenMatch[1].trim();

  // If it's already a clean URL or web path
  if (/^(?:https?:\/\/|www\.)[^\s]+$/i.test(str)) {
    return str;
  }

  // If it's a domain path like github.com/user/repo or linkedin.com/in/user
  if (/^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?$/i.test(str)) {
    return str;
  }

  // If it has spaces (e.g. "GitHub Repository (github.com)"), it is display text, not a URL
  return '';
};

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
    const parser = new PDFParse({
      data: new Uint8Array(file.buffer)
    });
  
    await parser.load();
  
    const parsed = await parser.getText({ parseHyperlinks: true });
  
    text = parsed?.text || '';
  
    await parser.destroy();
  } else if (isDocx(file)) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    text = parsed?.value || '';
  }

  const cleaned = text
    .replace(/\u0000/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
      title: asString(personal.title),
      email: asString(personal.email),
      phone: asString(personal.phone),
      location: asString(personal.location),
      website: sanitizeUrl(personal.website),
      github: sanitizeUrl(personal.github),
      linkedin: sanitizeUrl(personal.linkedin),
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
      url: sanitizeUrl(item?.url),
    })),
    projects: asArray(raw.projects).map((item) => ({
      title: asString(item?.title),
      role: asString(item?.role),
      startDate: asString(item?.startDate),
      endDate: asString(item?.endDate),
      url: sanitizeUrl(item?.url),
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
  "personalInfo": { "fullName": "", "title": "", "email": "", "phone": "", "location": "", "website": "", "github": "", "linkedin": "" },
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
- Group skills into logical categories with keywords arrays.
- For links: When hyperlinks are formatted like [Text](URL) or URLs appear in text, extract the actual target URL into website, github, linkedin, project url, or certification url fields. If no URL is provided, use an empty string. Never fabricate URLs.
- Extract EVERY certification, training, course, and credential listed under Certifications. Do NOT omit any certifications.`;

  const userMsg = `Resume text to import:\n${resumeText}`;
  let result;
  try {
    result = await executeAiChain({
      promptType: 'resume_import',
      systemMsg,
      userMsg,
      stream: false,
      maxTokens: 4000,
      responseFormat: { type: 'json_object' },
    });
  } catch (aiError) {
    console.error('[Resume Import] AI invocation failure:', aiError.message);
    throw new Error('AI parsing service is currently unavailable. Please try again shortly.');
  }

  if (!result?.text) {
    console.error('[Resume Import] AI returned an empty text payload');
    throw new Error('AI parser returned an empty response. Please try again.');
  }

  if (result.finishReason === 'length') {
    console.error('[Resume Import] AI output truncated due to token budget limit (finish_reason=length)');
    throw new Error('Resume content is too extensive for AI import. Please upload a more concise resume or add details in the builder.');
  }

  try {
    const parsed = JSON.parse(stripJsonFence(result.text));
    return normalizeImportedResume(parsed);
  } catch (parseError) {
    console.error('[Resume Import] Structured JSON parsing failed:', parseError.message);
    throw new Error('Could not parse resume data into the required format. Please try again or upload a cleaner resume file.');
  }
};

export const importResumeFile = async (file) => {
  const text = await extractResumeText(file);

  // High-fidelity Fast Track: Check if the PDF has embedded CareerForge metadata
  const metadataRegex = /\[CAREERFORGE_METADATA_START\](.*?)\[CAREERFORGE_METADATA_END\]/s;
  const match = text.match(metadataRegex);
  
  if (match && match[1]) {
    try {
      const parsedMetadata = JSON.parse(match[1].trim());
      // Found our own structured schema, bypass LLM
      const resume = normalizeImportedResume(parsedMetadata);
      return { resume, extractedTextLength: text.length };
    } catch (e) {
      console.warn("Found CareerForge metadata but failed to parse it, falling back to LLM", e);
    }
  }

  // Fallback: Proceed with LLM-based text parsing
  const resume = await parseResumeTextToSchema(text);
  return { resume, extractedTextLength: text.length };
};
