const transporter = require('../config/email');
const logger      = require('../utils/logger');

const APP_NAME = 'Smart Campus Lost & Found';
const FROM = () => `"${APP_NAME}" <${process.env.EMAIL_USER}>`;

function baseTemplate(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <div style="background:#1d4ed8;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${APP_NAME}</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding:16px 32px;background:#f3f4f6;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

const emailService = {
  async sendVerificationEmail(to, token) {
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const body = `
      <p style="color:#374151;line-height:1.6;">
        Thanks for registering! Please verify your email address to activate your account.
        This link expires in <strong>24 hours</strong>.
      </p>
      <a href="${link}"
         style="display:inline-block;margin:20px 0;padding:12px 28px;background:#1d4ed8;color:#ffffff;
                text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
        Verify Email Address
      </a>
      <p style="color:#6b7280;font-size:13px;margin-top:8px;">
        Or copy and paste this URL:<br>
        <a href="${link}" style="color:#1d4ed8;word-break:break-all;">${link}</a>
      </p>`;

    try {
      await transporter.sendMail({
        from:    FROM(),
        to,
        subject: `Verify your email — ${APP_NAME}`,
        html:    baseTemplate('Verify your email address', body),
      });
      logger.info(`EMAIL_SENT ✓ verification to=${to} link=${link}`);
    } catch (err) {
      logger.error(`EMAIL_FAILED ✗ verification to=${to} error="${err.message}"`);
      throw err; // re-throw so authService fire-and-forget .catch() receives it
    }
  },

  async sendPasswordResetEmail(to, token) {
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const body = `
      <p style="color:#374151;line-height:1.6;">
        We received a request to reset your password.
        This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.
      </p>
      <a href="${link}"
         style="display:inline-block;margin:20px 0;padding:12px 28px;background:#1d4ed8;color:#ffffff;
                text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
        Reset Password
      </a>
      <p style="color:#6b7280;font-size:13px;margin-top:8px;">
        Or copy and paste this URL:<br>
        <a href="${link}" style="color:#1d4ed8;word-break:break-all;">${link}</a>
      </p>`;

    try {
      await transporter.sendMail({
        from:    FROM(),
        to,
        subject: `Reset your password — ${APP_NAME}`,
        html:    baseTemplate('Reset your password', body),
      });
      logger.info(`EMAIL_SENT ✓ password-reset to=${to}`);
    } catch (err) {
      logger.error(`EMAIL_FAILED ✗ password-reset to=${to} error="${err.message}"`);
      throw err;
    }
  },
};

module.exports = emailService;
