#!/usr/bin/env node
/**
 * One-shot script: delete specific unverified users from MongoDB.
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/deleteUnverifiedUsers.js
 * Or set MONGODB_URI in backend/.env and run from the backend directory.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

const TARGETS = [
  'pmonisha2@gitam.in',
  'sjetti@gitam.in',
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'placeholder') {
    console.error('ERROR: MONGODB_URI is not set or is a placeholder. Set it in backend/.env or as an env var.');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(uri);
  console.log('Connected.\n');

  const db = mongoose.connection.db;
  const users = db.collection('users');

  for (const email of TARGETS) {
    const existing = await users.findOne({ email });
    if (!existing) {
      console.log(`NOT FOUND  — ${email}`);
      continue;
    }
    console.log(`FOUND      — ${email}  isVerified=${existing.isVerified}  _id=${existing._id}`);
    const result = await users.deleteOne({ email });
    if (result.deletedCount === 1) {
      console.log(`DELETED ✓  — ${email}`);
    } else {
      console.log(`DELETE FAILED ✗ — ${email}`);
    }
  }

  console.log('\nDone. Closing connection.');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
