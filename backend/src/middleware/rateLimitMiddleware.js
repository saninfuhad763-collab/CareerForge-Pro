import rateLimit from 'express-rate-limit';

/**
 * Dedicated rate limiter for sensitive authentication endpoints (login, register).
 * Protects against credential stuffing and brute-force registration attempts.
 * Window: 15 minutes, Max: 20 attempts per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});
