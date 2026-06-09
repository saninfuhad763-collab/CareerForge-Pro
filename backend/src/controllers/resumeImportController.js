import { importResumeFile } from '../services/resumeImportService.js';

export const importResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX resume file.',
      });
    }

    const result = await importResumeFile(req.file);

    res.status(200).json({
      success: true,
      message: 'Resume imported successfully.',
      data: result.resume,
      meta: {
        fileName: req.file.originalname,
        extractedTextLength: result.extractedTextLength,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Resume import failed. Please try again.',
    });
  }
};
