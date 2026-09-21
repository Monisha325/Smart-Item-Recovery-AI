#!/usr/bin/env node
/**
 * Runtime debug script — runs locally against production MongoDB + SMTP.
 * Set real values in backend/.env before running:
 *   node scripts/debugEmailFlow.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose  = require('mongoose');
const nodemailer = require('nodemailer');

const TARGETS = ['pmonisha2@gitam.in', 'sjetti@gitam.in'];

const sep = () => console.log('─'.repeat(60));

// ── 1. MongoDB deletion ───────────────────────────────────────────────────────
async function deleteUnverifiedUsers() {
  sep();
  console.log('STEP 1 — MongoDB: delete unverified users');
  sep();

  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'placeholder') {
    console.error('  ERROR: MONGODB_URI is a placeholder — update backend/.env');
    return false;
  }

  console.log(`  Connecting to MongoDB...`);
  await mongoose.connect(uri);
  console.log('  Connected ✓\n');

  const users = mongoose.connection.db.collection('users');

  for (const email of TARGETS) {
    const doc = await users.findOne({ email });
    if (!doc) {
      console.log(`  NOT FOUND  — ${email}`);
      continue;
    }
    console.log(`  FOUND      — ${email}`);
    console.log(`               _id        = ${doc._id}`);
    console.log(`               isVerified = ${doc.isVerified}`);
    console.log(`               createdAt  = ${doc.createdAt || 'n/a'}`);
    const r = await users.deleteOne({ email });
    if (r.deletedCount === 1) {
      console.log(`  DELETED ✓  — ${email}`);
    } else {
      console.log(`  DELETE FAILED ✗ — ${email}`);
    }
  }

  // Confirm
  const remaining = await users.countDocuments({ email: { $in: TARGETS } });
  console.log(`\n  Remaining docs for targets: ${remaining} (expect 0)`);
  await mongoose.disconnect();
  console.log('  MongoDB disconnected.\n');
  return true;
}

// ── 2. SMTP verification ──────────────────────────────────────────────────────
async function testSmtp() {
  sep();
  console.log('STEP 2 — SMTP: transporter.verify()');
  sep();

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  console.log(`  EMAIL_HOST = ${host}`);
  console.log(`  EMAIL_PORT = ${port}`);
  console.log(`  EMAIL_USER = ${user}`);
  console.log(`  EMAIL_PASS = ${pass && pass !== 'placeholder' ? '[set — ' + pass.length + ' chars]' : 'PLACEHOLDER — NOT SET'}`);
  console.log('');

  if (!host || host === 'placeholder' || !user || user === 'placeholder@gmail.com' || !pass || pass === 'placeholder') {
    console.log('  SMTP_FAILED ✗ — one or more EMAIL_* env vars are placeholders. Update backend/.env');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });

  return new Promise(resolve => {
    transporter.verify((err) => {
      if (err) {
        console.log(`  SMTP_FAILED ✗ error="${err.message}"`);
        if (err.message.includes('Invalid login') || err.message.includes('Username and Password')) {
          console.log('');
          console.log('  ROOT CAUSE: Gmail rejected the password.');
          console.log('  Gmail has blocked regular passwords since May 2022.');
          console.log('  You must use a 16-char App Password:');
          console.log('    Google Account → Security → 2-Step Verification → App Passwords');
          console.log('    Select app: Mail, device: Other → name it "Render" → copy 16 chars');
          console.log('    Paste that (no spaces) as EMAIL_PASS on Render + in backend/.env');
        }
        resolve(null);
      } else {
        console.log(`  SMTP_READY ✓ — authenticated to ${host} as ${user}`);
        resolve(transporter);
      }
    });
  });
}

// ── 3. Send test verification email ──────────────────────────────────────────
async function sendTestEmail(transporter, toAddress) {
  sep();
  console.log(`STEP 3 — sendVerificationEmail() to ${toAddress}`);
  sep();

  if (!transporter) {
    console.log('  SKIPPED — SMTP not ready (see Step 2 above)');
    return;
  }

  const token = 'debug-token-' + Date.now();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${clientUrl}/verify-email?token=${token}`;

  console.log(`  EMAIL_SEND_ATTEMPT ✓ to=${toAddress}`);
  console.log(`  link would be: ${link}`);

  try {
    const info = await transporter.sendMail({
      from:    `"Smart Campus Lost & Found" <${process.env.EMAIL_USER}>`,
      to:      toAddress,
      subject: 'DEBUG — Email verification test',
      html:    `<p>This is a runtime debug test from debugEmailFlow.js.<br>Token: <code>${token}</code><br>Link: <a href="${link}">${link}</a></p>`,
    });
    console.log(`  EMAIL_SENT ✓ messageId=${info.messageId} response="${info.response}"`);
  } catch (err) {
    console.log(`  EMAIL_FAILED ✗ error="${err.message}"`);
  }
}

// ── 4. @gitam.in restriction check ───────────────────────────────────────────
function checkDomainRestriction() {
  sep();
  console.log('STEP 4 — @gitam.in restriction');
  sep();

  const allowed = (process.env.ALLOWED_EMAIL_DOMAINS || '').split(',').map(d => d.trim()).filter(Boolean);
  console.log(`  ALLOWED_EMAIL_DOMAINS = [${allowed.join(', ') || 'none — any domain allowed'}]`);

  const tests = [
    { email: 'test@gitam.in',    expect: true },
    { email: 'test@gmail.com',   expect: false },
    { email: 'test@gitam.edu',   expect: false },
  ];

  for (const { email, expect } of tests) {
    const pass = !allowed.length || allowed.some(d => email.toLowerCase().endsWith(`@${d}`));
    const ok   = pass === expect;
    console.log(`  ${ok ? '✓' : '✗'} ${email.padEnd(24)} → ${pass ? 'ALLOWED' : 'BLOCKED'} (expected ${expect ? 'ALLOWED' : 'BLOCKED'})`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== SmartItemRecovery — Runtime Email Debug ===\n');
  console.log(`  NODE_ENV   = ${process.env.NODE_ENV}`);
  console.log(`  CLIENT_URL = ${process.env.CLIENT_URL}`);
  console.log('');

  checkDomainRestriction();

  await deleteUnverifiedUsers();

  const transporter = await testSmtp();

  // Send test email to the first target (they're deleted so won't conflict on re-register)
  await sendTestEmail(transporter, TARGETS[0]);

  sep();
  console.log('SUMMARY');
  sep();
  console.log('  Users deleted: check Step 1 above');
  console.log('  SMTP status:   check Step 2 above (SMTP_READY ✓ or SMTP_FAILED ✗)');
  console.log('  Email sent:    check Step 3 above (EMAIL_SENT ✓ or EMAIL_FAILED ✗)');
  console.log('  Next steps:');
  console.log('    - If SMTP_READY ✓ and EMAIL_SENT ✓ → check inbox + spam folder');
  console.log('    - If SMTP_FAILED ✗ Invalid login  → set App Password in Render env vars');
  console.log('    - Redeploy Render after changing env vars');
  console.log('');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
