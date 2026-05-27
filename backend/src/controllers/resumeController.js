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
        score: 45, // default baseline score for new resumes
        keywordsFound: [],
        keywordsMissing: [],
        feedback: ['Fill out your details to improve your score.'],
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

    // Mock dynamic ATS Score updates on save for visual feedback
    // Real ATS parsing will be integrated later, but standardizing dynamic changes now:
    let baseScore = 40;
    if (resume.personalInfo.fullName && resume.personalInfo.email) baseScore += 10;
    if (resume.summary && resume.summary.length > 50) baseScore += 15;
    if (resume.experience && resume.experience.length > 0) baseScore += 15;
    if (resume.education && resume.education.length > 0) baseScore += 10;
    if (resume.skills && resume.skills.length > 0) baseScore += 10;

    const feedback = [];
    if (baseScore < 60) feedback.push('Add experience and detailed skills to boost ATS scoring.');
    if (!resume.summary) feedback.push('Include a target professional summary tailored to your role.');
    if (resume.skills.length < 3) feedback.push('List core technical keywords under Skills (e.g. React, Mongoose).');
    
    resume.atsMetadata = {
      score: Math.min(baseScore, 100),
      keywordsFound: resume.skills.map(s => s.name).slice(0, 5),
      keywordsMissing: ['Scalability', 'System Design', 'CI/CD'], // placeholders for future AI integrations
      feedback: feedback.length > 0 ? feedback : ['Awesome profile completeness! Ready for job matching.'],
    };

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
