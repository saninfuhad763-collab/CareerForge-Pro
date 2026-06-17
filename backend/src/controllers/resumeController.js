import Resume from '../models/Resume.js';
import { generateResumePdf } from '../services/pdfService.js';
import { isPremiumTemplate, isProPlan, resolveTemplateForUser } from '../utils/planConstants.js';

// @desc    Get all resumes for the authenticated user
// @route   GET /api/resumes
// @access  Private
export const getResumes = async (req, res) => {
  try {
    // Return sorted by updated date (newest first)
    const resumes = await Resume.find({ userId: req.user._id })
      .select('title templateId atsMetadata createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify ownership
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resume' });
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Private
export const createResume = async (req, res) => {
  try {
    const { title, templateId } = req.body;
    const safeTemplateId = resolveTemplateForUser(templateId, req.user);

    if (isPremiumTemplate(templateId) && !isProPlan(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Classic and Minimalist templates are Pro-only. Upgrade to unlock premium templates.',
        requiresUpgrade: true,
        allowedTemplates: ['modern'],
      });
    }

    const newResume = new Resume({
      userId: req.user._id,
      title: title || 'My Professional Resume',
      templateId: safeTemplateId,
      personalInfo: {
        fullName: req.user.name,
        email: req.user.email,
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
      customSections: [],
      atsMetadata: {
        score: 0, // Starts at 0 until a real ATS analysis is performed
        keywordsFound: [],
        keywordsMissing: [],
        feedback: [],
      },
    });

    const savedResume = await newResume.save();

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: savedResume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing resume
// @route   PUT /api/resumes/:id
// @access  Private
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify ownership
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this resume' });
    }

    // Update body properties directly
    const fieldsToUpdate = [
      'title',
      'sectionOrder',
      'personalInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'certifications',
      'projects',
      'languages',
      'customSections',
    ];


    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        resume[field] = req.body[field];
      }
    });

    if (req.body.templateId !== undefined) {
      if (isPremiumTemplate(req.body.templateId) && !isProPlan(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Classic and Minimalist templates are Pro-only. Upgrade to unlock premium templates.',
          requiresUpgrade: true,
          allowedTemplates: ['modern'],
        });
      }
      resume.templateId = resolveTemplateForUser(req.body.templateId, req.user);
    }

    // Preserve existing atsMetadata; initialize with clean baseline if not present
    if (!resume.atsMetadata || typeof resume.atsMetadata.score !== 'number') {
      resume.atsMetadata = {
        score: 0,
        keywordsFound: [],
        keywordsMissing: [],
        feedback: [],
      };
    }


    const updatedResume = await resume.save();

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify ownership
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resume' });
    }

    await resume.deleteOne();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export resume as PDF
// @route   POST /api/resumes/:id/export-pdf
// @access  Private
export const exportResumePdf = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to export this resume' });
    }

    const exportResume = resume.toObject();
    if (isPremiumTemplate(exportResume.templateId) && !isProPlan(req.user)) {
      exportResume.templateId = 'modern';
    }

    const pdfBuffer = await generateResumePdf(exportResume);
    const safeTitle = (resume.title || 'resume')
      .replace(/[^a-z0-9-_ ]/gi, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() || 'resume';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('[PDF Export] Failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate PDF export.',
    });
  }
};
