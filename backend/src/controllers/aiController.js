import JobDescription from '../models/JobDescription.js';
import Resume from '../models/Resume.js';
import HistoryLog from '../models/HistoryLog.js';
import User from '../models/User.js';
import { isProPlan } from '../utils/planConstants.js';
import { executeAiChain, analyzeJobDescription, PROMPT_LIBRARY, getEmbeddingVector } from '../services/aiService.js';
import { calculateAtsScore } from '../services/atsService.js';

/**
 * Parses a Job Description, matches it against a Resume, updates ATS metadata, and returns the score
 */
import crypto from 'crypto';

/**
 * Sanitizes a keywordImportance plain-object so that all keys are safe for
 * MongoDB / Mongoose Map storage. MongoDB rejects Map keys that contain "."
 * (e.g. "Node.js", "React.js", "ASP.NET", ".NET") with a ValidationError.
 *
 * Strategy (Option B — persistence-layer transform only):
 *   • Replace every "." in a key with the token "___dot___"
 *   • The original analysis object (with un-sanitized keys) is NOT mutated
 *     and continues to flow through calculateAtsScore() unchanged.
 *   • No downstream consumer reads keywordImportance back from the database,
 *     so the transformed keys have zero impact on ATS scoring, recommendations,
 *     dashboard, or history views.
 *
 * @param {Object|undefined} importance - Raw keywordImportance from AI analysis
 * @returns {Object} - A new object with safe keys, safe to persist as a Mongoose Map
 */
const sanitizeKeywordImportanceKeys = (importance) => {
  if (!importance || typeof importance !== 'object' || Array.isArray(importance)) {
    return {};
  }
  const safe = {};
  for (const [key, value] of Object.entries(importance)) {
    // Replace ALL "." occurrences in the key with a safe token
    const safeKey = String(key).replace(/\./g, '___dot___');
    safe[safeKey] = value;
  }
  return safe;
};

const restoreKeywordImportanceKeys = (importance) => {
  if (!importance || typeof importance !== 'object') {
    return {};
  }
  const rawObj = typeof importance.toObject === 'function' ? importance.toObject() : importance;
  const restored = {};
  for (const [key, value] of Object.entries(rawObj)) {
    const normalKey = String(key).replace(/___dot___/g, '.');
    restored[normalKey] = value;
  }
  return restored;
};

const normalizeJdText = (text) => {
  if (!text) return '';
  return text
    // Strip invisible and non-breaking unicode characters before anything else
    .replace(/[\u00a0\u200b\u200c\u200d\u2028\u2029\ufeff\u00ad]/g, ' ')
    .toLowerCase()
    .trim()
    // Replace punctuation with spaces (handles React.js vs React js, Node.js, C++, etc.)
    .replace(/[.,/#!$%^&*;:{}=\-_`~()'"\[\]|\\<>@?]/g, ' ')
    // Collapse all whitespace sequences into a single space
    .replace(/\s+/g, ' ')
    .trim();
};

const generateJdHash = (text) => {
  return crypto.createHash('md5').update(normalizeJdText(text)).digest('hex');
};

export const analyzeJdAndScoreResume = async (req, res, next) => {
  try {
    const { 
      resumeId, 
      jdText, 
      jobTitle = 'Target Role', 
      company = 'Target Company',
      isPreset = false,
      presetMetadata = null
    } = req.body;

    if (!resumeId || !jdText || jdText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId and job description text.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found or unauthorized.' });
    }

    let calculatedScore;
    let breakdown;
    let jobDescriptionId = null;
    let analysis;

    const currentJdHash = generateJdHash(jdText);

    // 1. Check if a Job Description analysis already exists for this hash and user
    const existingJd = await JobDescription.findOne({
      userId: req.user._id,
      $or: [{ hash: currentJdHash }, { rawText: jdText }]
    });

    if (existingJd) {
      analysis = {
        requiredKeywords: existingJd.analysis?.requiredKeywords || [],
        preferredKeywords: existingJd.analysis?.preferredKeywords || [],
        softSkills: existingJd.analysis?.softSkills || [],
        technologies: existingJd.analysis?.technologies || [],
        certifications: existingJd.analysis?.certifications || [],
        keywordImportance: restoreKeywordImportanceKeys(existingJd.analysis?.keywordImportance)
      };
      jobDescriptionId = existingJd._id;
    } else {
      // 1. Analyze Job Description via LangChain/Groq Agent
      const analysisResult = await analyzeJobDescription(jdText);
      if (!analysisResult.success) {
        return res.status(500).json({ success: false, message: 'Failed to analyze Job Description.' });
      }

      analysis = analysisResult.analysis;

      // 2. Persist the JD analysis & Vector Embeddings
      const jdVector = getEmbeddingVector(jdText);
      const persistableAnalysis = {
        ...analysis,
        keywordImportance: sanitizeKeywordImportanceKeys(analysis.keywordImportance),
      };
      const newJd = await JobDescription.create({
        userId: req.user._id,
        hash: currentJdHash,
        jobTitle: analysis.jobTitle || jobTitle,
        company: analysis.company || company,
        rawText: jdText,
        analysis: persistableAnalysis,
        embedding: jdVector,
      });
      jobDescriptionId = newJd._id;
    }

    // 3. Compute ATS Score and recommendations
    const scoreResult = calculateAtsScore(resume, analysis);
    calculatedScore = scoreResult.atsScore;
    breakdown = scoreResult.breakdown;

    // 4. Update Resume ATS Metadata and Embeddings with ATS History Lifecycle
    const lastHash = resume.atsMetadata?.lastJdHash || '';

    let initialScore = resume.atsMetadata?.initialScore || 0;
    let optimizedScore = resume.atsMetadata?.optimizedScore || 0;
    let scoreImprovement = resume.atsMetadata?.scoreImprovement || 0;

    if (!lastHash || currentJdHash !== lastHash) {
      // State 1 / State 4: First analysis OR JD changed — reset baseline
      initialScore = calculatedScore;
      optimizedScore = 0;
      scoreImprovement = 0;
    } else {
      // State 3: Same JD, re-analysis — only record improvement if score actually changed
      if (initialScore === 0) initialScore = calculatedScore;

      const currentPersistedScore = resume.atsMetadata?.score || 0;
      if (calculatedScore !== currentPersistedScore) {
        // Meaningful change detected — update optimization record
        optimizedScore = calculatedScore;
        scoreImprovement = optimizedScore - initialScore;
      } else {
        // Score unchanged — preserve existing optimization state, avoid phantom records
        optimizedScore = resume.atsMetadata?.optimizedScore || 0;
        scoreImprovement = resume.atsMetadata?.scoreImprovement || 0;
      }
    }

    resume.atsMetadata = {
      score: calculatedScore,
      initialScore,
      optimizedScore,
      scoreImprovement,
      lastJdHash: currentJdHash,
      keywordsFound: (analysis.requiredKeywords || []).filter(kw => !(breakdown.missingKeywords || []).includes(kw)),
      keywordsMissing: breakdown.missingKeywords || [],
      feedback: breakdown.recommendations || [],
    };

    // Store resume embeddings vector for semantic matching
    const resumeTextCompiled = `${resume.title || ''} ${resume.summary || ''}`;
    resume.embedding = getEmbeddingVector(resumeTextCompiled);
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'ATS analysis and matching successfully calculated.',
      atsScore: calculatedScore,
      breakdown: breakdown,
      atsMetadata: resume.atsMetadata,
      jobDescriptionId: jobDescriptionId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Server-Sent Events (SSE) Endpoint for streaming AI resume rewrites in real time
 */
export const streamResumeRewrite = async (req, res, next) => {
  try {
    const { resumeId, promptType, originalText, contextKeyword = '' } = req.query;

    if (!resumeId || !promptType || !originalText) {
      return res.status(400).json({ success: false, message: 'Missing required query parameters: resumeId, promptType, originalText.' });
    }

    const selectedPrompt = PROMPT_LIBRARY[promptType];
    if (!selectedPrompt) {
      return res.status(400).json({ success: false, message: `Invalid promptType. Choose from: ${Object.keys(PROMPT_LIBRARY).join(', ')}` });
    }

    // Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering for instant delivery

    // Heartbeat mechanism to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 15000);

    let isClosed = false;
    req.on('close', () => {
      isClosed = true;
      clearInterval(heartbeat);
    });

    const normalizedContextKeyword = promptType === 'summary_rewrite'
      ? (Array.isArray(contextKeyword) ? contextKeyword : String(contextKeyword || '').split(','))
        .map(keyword => String(keyword).trim())
        .filter(Boolean)
      : contextKeyword;

    // Compile Prompt Templates
    const userMsg = selectedPrompt.template(originalText, normalizedContextKeyword);
    const systemMsg = selectedPrompt.system;

    // Stream the output
    const aiResult = await executeAiChain({
      promptType,
      systemMsg,
      userMsg,
      stream: true,
      sseResponse: res
    });

    if (isClosed) return;

    clearInterval(heartbeat);

    // Persist the History Log
    const newLog = await HistoryLog.create({
      userId: req.user._id,
      resumeId,
      actionType: promptType.includes('summary') ? 'summary_rewrite' : 'bullet_rewrite',
      originalContent: originalText,
      generatedContent: aiResult.text,
      promptType,
      promptVersion: selectedPrompt.version,
      tokensUsed: aiResult.tokensUsed,
      status: 'pending',
    });

    // Increment User's AI usage count
    await User.findByIdAndUpdate(req.user._id, { $inc: { aiRewriteCount: 1 } });

    // Send final log meta and terminate stream
    res.write(`data: ${JSON.stringify({ complete: true, logId: newLog._id, text: aiResult.text })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[SSE Controller] Streaming error encountered:', error.message);
    res.write(`data: ${JSON.stringify({ error: true, message: error.message })}\n\n`);
    res.end();
  }
};

/**
 * Updates the status of an AI rewrite log (accepts the modification)
 */
export const acceptRewrite = async (req, res, next) => {
  try {
    const { logId } = req.body;
    
    const log = await HistoryLog.findOne({ _id: logId, userId: req.user._id });
    if (!log) {
      return res.status(404).json({ success: false, message: 'History log not found.' });
    }

    log.status = 'accepted';
    await log.save();

    res.status(200).json({
      success: true,
      message: 'AI suggestion successfully accepted.',
      log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Performs a safe rollback to original content, returning the historic text
 */
export const rollbackRewrite = async (req, res, next) => {
  try {
    const { logId } = req.body;

    const log = await HistoryLog.findOne({ _id: logId, userId: req.user._id });
    if (!log) {
      return res.status(404).json({ success: false, message: 'History log not found.' });
    }

    log.status = 'rolled_back';
    await log.save();

    res.status(200).json({
      success: true,
      message: 'AI suggestion successfully rolled back.',
      originalContent: log.originalContent,
      log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets history logs for the current user and resume
 */
export const getHistoryLogs = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    
    const logs = await HistoryLog.find({ userId: req.user._id, resumeId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets subscription plan stats and limits for the user
 */
export const getPlanStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const resumeCount = await Resume.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      plan: user.plan,
      aiRewriteCount: user.aiRewriteCount,
      resumeCount,
      resumeLimit: isProPlan(user) ? Infinity : 1,
      aiLimit: isProPlan(user) ? Infinity : 10,
    });
  } catch (error) {
    next(error);
  }
};
