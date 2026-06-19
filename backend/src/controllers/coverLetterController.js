import Resume from '../models/Resume.js';
import { executeAiChain, PROMPT_LIBRARY } from '../services/aiService.js';

/**
 * @desc    Generate a professional cover letter using resume details and JD
 * @route   POST /api/ai/generate-cover-letter
 * @access  Private
 */
export const generateCoverLetter = async (req, res, next) => {
  try {
    const { resumeId, companyName, jobTitle, jobDescription } = req.body;

    if (!resumeId || !companyName || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resumeId, companyName, and jobTitle.',
      });
    }

    // 1. Load resume by ID and verify ownership
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized.',
      });
    }

    // 2. Extract and format Resume Details
    const resumeData = {
      fullName: resume.personalInfo?.fullName || '',
      email: resume.personalInfo?.email || '',
      phone: resume.personalInfo?.phone || '',
      location: resume.personalInfo?.location || '',
      summary: resume.summary || '',
      experience: resume.experience
        ?.map(
          (exp) =>
            `${exp.position || ''} at ${exp.company || ''} (${exp.startDate || ''} - ${exp.endDate || ''}): ${
              exp.description || ''
            }`
        )
        .join('\n') || '',
      skills: resume.skills
        ?.map((skill) => `${skill.name || ''}: ${skill.keywords?.join(', ') || ''}`)
        .join('\n') || '',
      projects: resume.projects
        ?.map(
          (proj) =>
            `${proj.title || ''} (${proj.role || ''}): ${proj.description || ''}`
        )
        .join('\n') || '',
    };

    const jobData = {
      jobTitle,
      companyName,
      jobDescription: jobDescription || '',
    };

    // 3. Compile prompt messages
    const selectedPrompt = PROMPT_LIBRARY.generate_cover_letter;
    const systemMsg = selectedPrompt.system;
    const userMsg = selectedPrompt.template(resumeData, jobData);

    // 4. Run AI chain
    const aiResult = await executeAiChain({
      promptType: 'generate_cover_letter',
      systemMsg,
      userMsg,
      stream: false,
    });

    // Replace the placeholders with candidate info if the LLM output retains them
    let finalizedCoverLetter = aiResult.text;
    
    // Simple regex post-process for standard placeholders just in case
    if (resumeData.fullName) {
      finalizedCoverLetter = finalizedCoverLetter.replace(/\[Your Name\]/gi, resumeData.fullName);
    }
    if (resumeData.email) {
      finalizedCoverLetter = finalizedCoverLetter.replace(/\[Your Email\]/gi, resumeData.email);
    }
    if (resumeData.phone) {
      finalizedCoverLetter = finalizedCoverLetter.replace(/\[Your Phone Number\]/gi, resumeData.phone);
    }
    if (resume.personalInfo?.location) {
      finalizedCoverLetter = finalizedCoverLetter.replace(/\[Your Address\]/gi, resume.personalInfo.location);
    }
    finalizedCoverLetter = finalizedCoverLetter.replace(/\[Company Name\]/gi, companyName);
    finalizedCoverLetter = finalizedCoverLetter.replace(/\[Job Title\]/gi, jobTitle);
    finalizedCoverLetter = finalizedCoverLetter.replace(/\[Date\]/gi, new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));

    // 5. Return the response
    return res.status(200).json({
      success: true,
      coverLetter: finalizedCoverLetter,
    });
  } catch (error) {
    next(error);
  }
};
