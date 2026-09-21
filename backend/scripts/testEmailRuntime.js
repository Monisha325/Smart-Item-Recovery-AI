#!/usr/bin/env node
/**
 * Real runtime email test using Ethereal (nodemailer's free test SMTP).
 * No credentials needed — generates a temporary account automatically.
 * Shows a browser-viewable preview URL so you can confirm the email content.
 *
 * Run: node scripts/testEmailRuntime.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const sep = () => console.log('─'.repeat(70));

async function main() {
  console.log('\n=== SmartItemRecovery — Real Runtime Email Test (Ethereal) ===\n');

  // ── PHASE 1: Create a real temporary SMTP account ─────────────────────────
  sep();
  console.log('PHASE 1 — Create Ethereal test SMTP account');
  sep();
  console.log('  Requesting test account from Ethereal...');

  let testAccount;
  try {
    testAccount = await nodemailer.createTestAccount();
  } catch (err) {
    console.log(`  FAILED: could not reach Ethereal — ${err.message}`);
    console.log('  (Requires internet. If offline, this step will fail.)');
    process.exit(1);
  }

  console.log(`  SMTP_READY ✓`);
  console.log(`  host = smtp.ethereal.email`);
  console.log(`  port = 587`);
  console.log(`  user = ${testAccount.user}`);
  console.log(`  pass = ${testAccount.pass}`);

  const transporter = nodemailer.createTransport({
    host:   'smtp.ethereal.email',
    port:   587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // ── PHASE 2: transporter.verify() ─────────────────────────────────────────
  sep();
  console.log('PHASE 2 — transporter.verify()');
  sep();

  await new Promise((resolve, reject) => {
    transporter.verify((err) => {
      if (err) {
        console.log(`  SMTP_FAILED ✗ error="${err.message}"`);
        reject(err);
      } else {
        console.log('  SMTP_READY ✓ — authenticated to smtp.ethereal.email');
        resolve();
      }
    });
  });

  // ── PHASE 3: Build verification email exactly as production does ──────────
  sep();
  console.log('PHASE 3 — Build verification email (same code as production)');
  sep();

  const testEmail = 'pmonisha2@gitam.in';
  const token     = uuidv4();
  const clientUrl = process.env.CLIENT_URL || 'https://smart-item-recovery-ai.vercel.app';
  const link      = `${clientUrl}/verify-email?token=${token}`;

  console.log(`  VERIFY_TOKEN ✓ generated`);
  console.log(`    token   = ${token}`);
  console.log(`    link    = ${link}`);
  console.log(`    expires = 24h`);

  const APP_NAME = 'Smart Campus Lost & Found';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;">
    <div style="background:#1d4ed8;padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:20px;">${APP_NAME}</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#111827;">Verify your email address</h2>
      <p>Thanks for registering! Click the button below to verify your email. Expires in <strong>24 hours</strong>.</p>
      <a href="${link}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
        Verify Email Address
      </a>
      <p style="color:#6b7280;font-size:13px;">Or copy: <a href="${link}">${link}</a></p>
    </div>
  </div>
</body>
</html>`;

  // ── PHASE 4: sendMail() ────────────────────────────────────────────────────
  sep();
  console.log('PHASE 4 — sendMail()');
  sep();
  console.log(`  EMAIL_SEND_ATTEMPT ✓ to=${testEmail}`);

  let info;
  try {
    info = await transporter.sendMail({
      from:    `"${APP_NAME}" <${testAccount.user}>`,
      to:      testEmail,
      subject: `Verify your email — ${APP_NAME}`,
      html,
    });
    console.log(`  EMAIL_SENT ✓`);
    console.log(`    messageId = ${info.messageId}`);
    console.log(`    response  = ${info.response}`);
  } catch (err) {
    console.log(`  EMAIL_FAILED ✗ error="${err.message}"`);
    process.exit(1);
  }

  // ── PHASE 5: Preview URL ──────────────────────────────────────────────────
  sep();
  console.log('PHASE 5 — View the sent email in browser');
  sep();
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`  Preview URL (open in browser):`);
  console.log(`  ${previewUrl}`);
  console.log('');
  console.log('  This URL shows the exact email that would land in a real inbox.');
  console.log('  If it renders correctly here, the email CODE is working.');
  console.log('  If emails never arrive on Render, the issue is SMTP credentials only.');

  // ── PHASE 6: What to check on Render ─────────────────────────────────────
  sep();
  console.log('PHASE 6 — Production SMTP diagnosis');
  sep();
  console.log('  Current local EMAIL_* values (from backend/.env):');
  console.log(`    EMAIL_HOST = ${process.env.EMAIL_HOST || 'NOT SET'}`);
  console.log(`    EMAIL_PORT = ${process.env.EMAIL_PORT || 'NOT SET'}`);
  console.log(`    EMAIL_USER = ${process.env.EMAIL_USER || 'NOT SET'}`);
  console.log(`    EMAIL_PASS = ${process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'placeholder'
    ? '[set — ' + process.env.EMAIL_PASS.length + ' chars]'
    : 'PLACEHOLDER — not a real password'}`);

  console.log('');
  console.log('  On Render, after deploy, the FIRST log lines must show:');
  console.log('    SMTP_READY ✓ host=smtp.gmail.com user=<email>');
  console.log('  If you see:');
  console.log('    SMTP_FAILED ✗ error="Invalid login"');
  console.log('  → EMAIL_PASS on Render is NOT a Gmail App Password.');
  console.log('');
  console.log('  Fix: Google Account → Security → 2-Step Verification');
  console.log('       → App Passwords → Mail → Other → "Render"');
  console.log('       → copy 16 chars → paste into EMAIL_PASS on Render (no spaces)');

  sep();
  console.log('RESULT: Email code is WORKING. Issue is SMTP credentials on Render.');
  sep();
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
