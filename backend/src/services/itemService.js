const axios    = require('axios');
const cloudinary = require('../config/cloudinary');
const aiClient   = require('../utils/aiClient');
const itemRepo   = require('../repositories/itemRepo');
const matchRepo  = require('../repositories/matchRepo');
const notificationRepo = require('../repositories/notificationRepo');
const logger     = require('../utils/logger');
const { createItemSchema, updateItemSchema } = require('../validators/itemValidators');

// ── Helpers ───────────────────────────────────────────────────────────────────

function apiErr(message, statusCode = 400) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'lostandfound' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

// ── AI enrichment (called via setImmediate — never throws to caller) ──────────

async function enrichItemWithAI(itemId) {
  try {
    const item = await itemRepo.findById(itemId);
    if (!item) return;

    let imageLabels = item.imageLabels ?? [];

    if (item.images?.length > 0) {
      try {
        const resp = await axios.get(item.images[0].url, {
          responseType: 'arraybuffer',
          timeout: 15_000,
        });
        imageLabels = await aiClient.extractImageLabels(Buffer.from(resp.data));
        await itemRepo.update(itemId, { imageLabels });
      } catch (err) {
        logger.warn(`Image labeling skipped for ${itemId}: ${err.message}`);
      }
    }

    const text = [item.title, item.description, item.color ?? '', imageLabels.join(' ')]
      .join(' ')
      .trim();
    const embeddingVector = await aiClient.generateEmbedding(text);
    await itemRepo.update(itemId, { embeddingVector });
  } catch (err) {
    logger.error(`AI enrichment failed for ${itemId}: ${err.message}`);
  }
}

function schedulePostCreatePipeline(itemId) {
  setImmediate(async () => {
    try {
      await enrichItemWithAI(itemId);
      // Late-require to avoid circular dependency at module init time
      const matchService = require('./matchService');
      await matchService.triggerMatchingForItem(itemId);
    } catch (err) {
      logger.error(`Post-create pipeline failed for ${itemId}: ${err.message}`);
    }
  });
}

// ── Service ───────────────────────────────────────────────────────────────────

const itemService = {
  async createItem(userId, body, files) {
    // 1. Validate
    const parsed = createItemSchema.safeParse(body);
    if (!parsed.success) {
      const e = apiErr('Validation failed');
      e.errors = parsed.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }));
      throw e;
    }
    const data = parsed.data;

    // 2. Upload images
    const images = files?.length
      ? await Promise.all(files.map(f => uploadToCloudinary(f.buffer)))
      : [];

    // 3. Initial status from type
    const status = data.type === 'lost' ? 'LOST' : 'FOUND';

    // 4. Persist
    const item = await itemRepo.create({ ...data, userId, images, status });

    // 5 & 6. Fire-and-forget: AI enrichment → matching
    schedulePostCreatePipeline(item._id);

    return item;
  },

  async getItems(query) {
    const { type, category, status, search, page = 1, limit = 20 } = query;
    return itemRepo.findMany({ type, category, status, search, page, limit });
  },

  async getItemById(id) {
    const item = await itemRepo.findById(id);
    if (!item) throw apiErr('Item not found', 404);
    return item;
  },

  async updateItem(userId, itemId, body, role) {
    // 1. Validate
    const parsed = updateItemSchema.safeParse(body);
    if (!parsed.success) {
      const e = apiErr('Validation failed');
      e.errors = parsed.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }));
      throw e;
    }
    const data = parsed.data;

    // 2. Ownership check
    const item = await itemRepo.findById(itemId);
    if (!item) throw apiErr('Item not found', 404);
    if (item.userId._id.toString() !== userId.toString() && role !== 'admin') {
      throw apiErr('Forbidden', 403);
    }

    // 3. Persist
    const updated = await itemRepo.update(itemId, data);

    // 4. Re-enrich if searchable text changed
    if (data.title !== undefined || data.description !== undefined) {
      setImmediate(async () => {
        try {
          await enrichItemWithAI(itemId);
          const matchService = require('./matchService');
          await matchService.triggerMatchingForItem(itemId);
        } catch (err) {
          logger.error(`Post-update pipeline failed for ${itemId}: ${err.message}`);
        }
      });
    }

    return updated;
  },

  async deleteItem(userId, itemId, role) {
    // 1. Ownership check
    const item = await itemRepo.findById(itemId);
    if (!item) throw apiErr('Item not found', 404);
    if (item.userId._id.toString() !== userId.toString() && role !== 'admin') {
      throw apiErr('Forbidden', 403);
    }

    // 2. Delete Cloudinary assets (best-effort — don't block on CDN failures)
    if (item.images?.length) {
      await Promise.allSettled(
        item.images.map(img => cloudinary.uploader.destroy(img.publicId))
      );
    }

    // 3. Delete item + cascades
    await Promise.all([
      itemRepo.delete(itemId),
      matchRepo.deleteByItem(itemId),
      notificationRepo.deleteByItem(itemId),
    ]);
  },

  async getItemsByUser(userId, query = {}) {
    const { page = 1, limit = 20 } = query;
    return itemRepo.findByUser(userId, page, limit);
  },
};

module.exports = itemService;
