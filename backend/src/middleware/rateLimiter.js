const rateLimit = require('express-rate-limit');

const defaultLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Tighter limit for auth endpoints to slow credential stuffing.
const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

module.exports = { defaultLimiter, authLimiter };
