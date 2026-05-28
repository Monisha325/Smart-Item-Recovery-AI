const nodemailer = require('nodemailer');
const logger     = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: false, // STARTTLS on port 587 — do NOT set true here
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP credentials at startup so any misconfiguration is immediately
// visible in Render logs — does not block the server from starting.
transporter.verify((err) => {
  if (err) {
    logger.error(
      `EMAIL ✗ SMTP not ready — host=${process.env.EMAIL_HOST} ` +
      `user=${process.env.EMAIL_USER} error="${err.message}"`
    );
  } else {
    logger.info(
      `EMAIL ✓ SMTP ready — host=${process.env.EMAIL_HOST} ` +
      `user=${process.env.EMAIL_USER}`
    );
  }
});

module.exports = transporter;
