const { z } = require('zod');

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map(d => d.trim())
  .filter(Boolean);

const emailDomainCheck = (email) => {
  if (!ALLOWED_DOMAINS.length) return true;
  return ALLOWED_DOMAINS.some(d => email.toLowerCase().endsWith(`@${d}`));
};

const domainMessage = ALLOWED_DOMAINS.length
  ? `Email must end with one of: ${ALLOWED_DOMAINS.join(', ')}`
  : 'Invalid email';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email:    z.string().email('Invalid email format').refine(emailDomainCheck, domainMessage),
  password: passwordSchema,
  campusId: z.string().min(3, 'Campus ID must be at least 3 characters').trim(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token:       z.string().min(1, 'Token is required'),
  newPassword: passwordSchema,
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
