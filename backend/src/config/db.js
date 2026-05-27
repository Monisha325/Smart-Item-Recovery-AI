const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function connectDB(attempt = 1) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      logger.error(`MongoDB failed after ${MAX_RETRIES} attempts:`, err.message);
      process.exit(1);
    }
    logger.warn(`MongoDB attempt ${attempt}/${MAX_RETRIES} failed — retrying in ${RETRY_DELAY_MS / 1000}s`);
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    return connectDB(attempt + 1);
  }
}

module.exports = connectDB;
