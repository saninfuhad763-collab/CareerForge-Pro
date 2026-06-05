import Resume from '../models/Resume.js';

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

    const newResume = new Resume({
      userId: req.user._id,
      title: title || 'My Professional Resume',
      templateId: templateId || 'modern',
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
      'templateId',
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

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
