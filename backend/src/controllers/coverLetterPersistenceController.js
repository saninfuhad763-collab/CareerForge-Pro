import CoverLetter from '../models/CoverLetter.js';
import Resume from '../models/Resume.js';

/**
 * @desc    Save a new cover letter
 * @route   POST /api/cover-letters
 * @access  Private
 */
export const saveCoverLetter = async (req, res, next) => {
  try {
    const { resumeId, companyName, jobTitle, coverLetter } = req.body;

    if (!resumeId || !companyName || !jobTitle || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resumeId, companyName, jobTitle, and coverLetter.',
      });
    }

    // Verify resume exists and belongs to the user
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Associated resume not found or unauthorized.',
      });
    }

    const newCoverLetter = await CoverLetter.create({
      userId: req.user._id,
      resumeId,
      companyName,
      jobTitle,
      coverLetter,
    });

    res.status(201).json({
      success: true,
      data: newCoverLetter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all cover letters for the logged-in user
 * @route   GET /api/cover-letters
 * @access  Private
 */
export const getCoverLetters = async (req, res, next) => {
  try {
    const coverLetters = await CoverLetter.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('resumeId', 'title');

    res.status(200).json({
      success: true,
      count: coverLetters.length,
      data: coverLetters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a cover letter
 * @route   DELETE /api/cover-letters/:id
 * @access  Private
 */
export const deleteCoverLetter = async (req, res, next) => {
  try {
    const coverLetter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user._id });

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found or unauthorized.',
      });
    }

    await coverLetter.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Cover letter deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
