const router  = require('express').Router();
const User    = require('../models/User');
const emailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const logger  = require('../utils/logger');
const { success } = require('../utils/apiResponse');

// Guard: every request must carry the service secret as a header.
function requireServiceSecret(req, res, next) {
  const secret = process.env.AI_SERVICE_SECRET;
  if (!secret) return res.status(503).json({ success: false, message: 'Maintenance not configured' });
  if (req.headers['x-service-secret'] !== secret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
}

router.use(requireServiceSecret);

// GET /api/maintenance/users
// Lists every registered user (no passwords) sorted newest first.
router.get('/users', async (req, res) => {
  const users = await User.find({}, '-password -emailVerificationToken')
    .sort({ createdAt: -1 })
    .lean();

  const summary = users.map(u => ({
    email:      u.email,
    name:       u.name,
    isVerified: u.isVerified,
    isBanned:   u.isBanned,
    role:       u.role,
    createdAt:  u.createdAt,
  }));

  return success(res, {
    total:      summary.length,
    verified:   summary.filter(u =>  u.isVerified).length,
    unverified: summary.filter(u => !u.isVerified).length,
    users:      summary,
  });
});

// POST /api/maintenance/resend-all
// Resends a fresh 24-h verification link to every unverified user.
router.post('/resend-all', async (req, res) => {
  const unverified = await User.find({ isVerified: false }).lean();
  logger.info(`MAINTENANCE resend-all: found ${unverified.length} unverified users`);

  const results = [];

  for (const u of unverified) {
    const token   = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(u._id, {
      emailVerificationToken:   token,
      emailVerificationExpires: expires,
    });

    try {
      await emailService.sendVerificationEmail(u.email, token);
      logger.info(`MAINTENANCE EMAIL_SENT ✓ to=${u.email}`);
      results.push({ email: u.email, status: 'sent' });
    } catch (err) {
      logger.error(`MAINTENANCE EMAIL_FAILED ✗ to=${u.email} error="${err.message}"`);
      results.push({ email: u.email, status: 'failed', error: err.message });
    }
  }

  return success(res, { processed: results.length, results });
});

// DELETE /api/maintenance/users/unverified
// Deletes all unverified users (or specific emails via body: { emails: [...] }).
router.delete('/users/unverified', async (req, res) => {
  const { emails } = req.body || {};
  const filter = { isVerified: false };
  if (Array.isArray(emails) && emails.length) {
    filter.email = { $in: emails.map(e => e.toLowerCase()) };
  }

  const result = await User.deleteMany(filter);
  logger.info(`MAINTENANCE deleted ${result.deletedCount} unverified user(s)`);
  return success(res, { deletedCount: result.deletedCount });
});

module.exports = router;
