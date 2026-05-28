const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const userRepo      = require('../repositories/userRepo');
const Item          = require('../models/Item');
const PasswordReset = require('../models/PasswordReset');
const emailService = require('./emailService');
const logger       = require('../utils/logger');

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map(d => d.trim())
  .filter(Boolean);

function apiError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  return obj;
}

const authService = {
  async register(data) {
    logger.info(`REGISTER attempt email=${data.email} allowedDomains=[${ALLOWED_DOMAINS.join(', ') || 'any'}]`);

    // 1. Validate email domain
    if (ALLOWED_DOMAINS.length) {
      const valid = ALLOWED_DOMAINS.some(d => data.email.toLowerCase().endsWith(`@${d}`));
      if (!valid) {
        logger.warn(`REGISTER ✗ domain rejected email=${data.email}`);
        throw apiError('Email domain is not allowed', 400);
      }
    }

    // 2. Check uniqueness
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      logger.warn(`REGISTER ✗ duplicate email=${data.email}`);
      throw apiError('Email already registered', 409);
    }

    // 3. Hash password
    const password = await bcrypt.hash(data.password, 12);

    const isDev = process.env.NODE_ENV !== 'production';

    const emailVerificationToken   = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    logger.info(`VERIFY_TOKEN ✓ generated email=${data.email} expires=${emailVerificationExpires.toISOString()} isDev=${isDev}`);

    await userRepo.create({
      name:  data.name,
      email: data.email,
      password,
      campusId: data.campusId,
      isVerified: isDev,
      emailVerificationToken:   isDev ? undefined : emailVerificationToken,
      emailVerificationExpires: isDev ? undefined : emailVerificationExpires,
    });

    logger.info(`REGISTER ✓ user created email=${data.email} isDev=${isDev}`);

    if (isDev) {
      return { message: 'Account created. You can log in immediately (dev mode).', devAutoVerified: true };
    }

    logger.info(`EMAIL_SEND_ATTEMPT ✓ queuing verification email=${data.email}`);
    emailService
      .sendVerificationEmail(data.email, emailVerificationToken)
      .catch(err => logger.error(`EMAIL_FAILED ✗ fire-and-forget email=${data.email} error="${err.message}"`));

    // 7. No JWT yet — user must verify first
    return { message: 'Verification email sent. Please check your inbox.' };
  },

  async verifyEmail(token) {
    if (!token) throw apiError('Token is required', 400);

    const user = await userRepo.findByVerificationToken(token);
    if (!user) throw apiError('Invalid or expired verification link', 400);

    await userRepo.updateById(user._id, {
      $set:   { isVerified: true },
      $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
    });

    const updated = await userRepo.findById(user._id);
    return { token: signToken(updated), user: safeUser(updated) };
  },

  async login(email, password) {
    // findByEmail returns password field (no select projection)
    const user = await userRepo.findByEmail(email);
    if (!user) throw apiError('Invalid credentials', 401);

    if (!user.isVerified) throw apiError('Please verify your email before logging in', 403);
    if (user.isBanned)    throw apiError('Your account has been suspended', 403);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw apiError('Invalid credentials', 401);

    return { token: signToken(user), user: safeUser(user) };
  },

  async forgotPassword(email) {
    const user = await userRepo.findByEmail(email);

    // Always succeed — do not leak whether email exists
    if (user) {
      const token     = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await PasswordReset.create({ userId: user._id, token, expiresAt });
      emailService
        .sendPasswordResetEmail(user.email, token)
        .catch(err => logger.error('Reset email failed:', err.message));
    }

    return { message: "If that email exists, a reset link was sent." };
  },

  async resetPassword(token, newPassword) {
    if (!token) throw apiError('Token is required', 400);

    const reset = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() },
      used: false,
    });
    if (!reset) throw apiError('Invalid or expired reset link', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await userRepo.updateById(reset.userId, { password: hashed });
    await PasswordReset.findByIdAndUpdate(reset._id, { used: true });

    return { message: 'Password reset successfully. Please log in.' };
  },

  async resendVerification(email) {
    const user = await userRepo.findByEmail(email);
    if (!user || user.isVerified) {
      return { message: 'If your account exists and is unverified, a new link has been sent.' };
    }
    const emailVerificationToken   = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await userRepo.updateById(user._id, { emailVerificationToken, emailVerificationExpires });
    logger.info(`REGISTER resend requested email=${email}`);
    emailService
      .sendVerificationEmail(email, emailVerificationToken)
      .catch(err => logger.error(`EMAIL ✗ resend failed email=${email} error="${err.message}"`));
    return { message: 'If your account exists and is unverified, a new link has been sent.' };
  },

  async getMe(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw apiError('User not found', 404);
    return user;
  },

  async updateProfile(userId, { name, campusId }) {
    const updated = await userRepo.updateById(userId, { name, campusId });
    if (!updated) throw apiError('User not found', 404);
    return safeUser(updated);
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepo.findByIdWithPassword(userId);
    if (!user) throw apiError('User not found', 404);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw apiError('Current password is incorrect', 400);
    const hashed = await bcrypt.hash(newPassword, 12);
    await userRepo.updateById(userId, { password: hashed });
    return { message: 'Password changed successfully' };
  },

  async getMyStats(userId) {
    const [lostCount, foundCount, recoveredCount] = await Promise.all([
      Item.countDocuments({ userId, type: 'lost' }),
      Item.countDocuments({ userId, type: 'found' }),
      Item.countDocuments({ userId, status: { $in: ['CLAIMED', 'RETURNED'] } }),
    ]);
    return { lostCount, foundCount, recoveredCount };
  },
};

module.exports = authService;
