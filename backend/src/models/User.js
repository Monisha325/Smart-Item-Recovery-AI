const mongoose = require('mongoose');

// Build domain regex from env at startup so it is evaluated once.
const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map(d => d.trim())
  .filter(Boolean);

const domainRegex = allowedDomains.length
  ? new RegExp(`@(${allowedDomains.map(d => d.replace(/\./g, '\\.')).join('|')})$`, 'i')
  : /.+@.+\..+/;

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    match:     [domainRegex, 'Email must belong to an allowed campus domain'],
  },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'admin'], default: 'student' },
  campusId:   { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isBanned:   { type: Boolean, default: false },
  emailVerificationToken:   { type: String },
  emailVerificationExpires: { type: Date },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
