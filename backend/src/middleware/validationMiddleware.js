export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }
  next();
};

export const validateResume = (req, res, next) => {
  const { title } = req.body;
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ success: false, message: 'Resume title must be a non-empty string' });
  }
  next();
};
