import ContactMessage from '../models/ContactMessage.js';

/**
 * @desc    Submit a new contact message
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};
