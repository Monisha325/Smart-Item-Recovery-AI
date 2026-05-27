const axios    = require('axios');
const FormData = require('form-data');
const logger   = require('./logger');

const http = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  timeout: 15_000,
  headers: { 'X-AI-Service-Secret': process.env.AI_SERVICE_SECRET || '' },
});

function _cosine(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * (b[i] ?? 0);
    normA += a[i] * a[i];
    normB += (b[i] ?? 0) * (b[i] ?? 0);
  }
  if (normA === 0 || normB === 0) return 0;
  return Math.min(1, Math.max(0, dot / (Math.sqrt(normA) * Math.sqrt(normB))));
}

const aiClient = {
  /**
   * POST /embed — returns float vector or null on failure.
   * @param {string} text
   * @returns {Promise<number[] | null>}
   */
  async generateEmbedding(text) {
    try {
      const res = await http.post('/embed', { text });
      return Array.isArray(res.data?.embedding) ? res.data.embedding : null;
    } catch (err) {
      logger.warn('aiClient.generateEmbedding failed:', err.message);
      return null;
    }
  },

  /**
   * POST /image-labels — multipart/form-data, returns label strings or [] on failure.
   * @param {Buffer} imageBuffer
   * @returns {Promise<string[]>}
   */
  async extractImageLabels(imageBuffer) {
    try {
      const form = new FormData();
      form.append('file', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
      const res = await http.post('/image-labels', form, {
        headers: form.getHeaders(),
        timeout: 15_000,
      });
      return Array.isArray(res.data?.labels) ? res.data.labels : [];
    } catch (err) {
      logger.warn('aiClient.extractImageLabels failed:', err.message);
      return [];
    }
  },

  /**
   * Local cosine similarity — no network call.
   * @param {number[]} a
   * @param {number[]} b
   * @returns {number} 0–1
   */
  computeSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || !a.length || !b.length) return 0;
    return _cosine(a, b);
  },
};

module.exports = aiClient;
