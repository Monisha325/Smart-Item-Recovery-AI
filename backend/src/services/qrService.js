const { v4: uuid }        = require('uuid');
const Item                = require('../models/Item');
const User                = require('../models/User');
const qrRepo              = require('../repositories/qrRepo');
const notificationService = require('./notificationService');
const logger              = require('../utils/logger');

const qrService = {
  generateQRTag: async (userId, itemId) => {
    const item = await Item.findById(itemId);
    if (!item) {
      const err = new Error('Item not found'); err.statusCode = 404; throw err;
    }
    if (item.userId.toString() !== userId.toString()) {
      const err = new Error('Not authorized'); err.statusCode = 403; throw err;
    }
    // Idempotent — return existing tag if already generated
    if (item.qrTagId) {
      const existing = await qrRepo.findById(item.qrTagId);
      if (existing) return existing;
    }
    const tag = await qrRepo.create({ itemId: item._id, userId, token: uuid() });
    await Item.findByIdAndUpdate(itemId, { $set: { qrTagId: tag._id } });
    return tag;
  },

  getQRTagForItem: async (itemId, userId) => {
    const tag = await qrRepo.findByItem(itemId);
    if (!tag) {
      const err = new Error('QR tag not found'); err.statusCode = 404; throw err;
    }
    if (tag.userId.toString() !== userId.toString()) {
      const err = new Error('Not authorized'); err.statusCode = 403; throw err;
    }
    return tag;
  },

  handleQRScan: async (token) => {
    const tag = await qrRepo.findByToken(token);
    if (!tag) {
      const err = new Error('QR code not found'); err.statusCode = 404; throw err;
    }
    // tag.userId / tag.itemId are populated by findByToken
    const ownerId = tag.userId?._id ?? tag.userId;
    const itemId  = tag.itemId?._id ?? tag.itemId;

    const updatedTag = await qrRepo.incrementScan(tag._id);

    // Fire-and-forget notification
    notificationService.createNotification(
      ownerId,
      'QR_SCANNED',
      `Your QR tag was scanned.`,
      itemId
    );

    const [item, owner] = await Promise.all([
      Item.findById(itemId, 'title description category color type status location images').lean(),
      User.findById(ownerId, 'name campusId').lean(),
    ]);

    if (!item || !owner) {
      const err = new Error('Item not found'); err.statusCode = 404; throw err;
    }

    return {
      item: {
        _id:         item._id,
        title:       item.title,
        description: item.description,
        category:    item.category,
        color:       item.color,
        type:        item.type,
        status:      item.status,
        location:    item.location,
        image:       item.images?.[0] ?? null,
      },
      owner: {
        name:     owner.name,
        campusId: owner.campusId,
      },
      scannedCount: updatedTag.scannedCount,
    };
  },

  deleteQRTag: async (itemId, userId) => {
    const tag = await qrRepo.findByItem(itemId);
    if (!tag) {
      const err = new Error('QR tag not found'); err.statusCode = 404; throw err;
    }
    if (tag.userId.toString() !== userId.toString()) {
      const err = new Error('Not authorized'); err.statusCode = 403; throw err;
    }
    await qrRepo.deleteById(tag._id);
    await Item.findByIdAndUpdate(itemId, { $unset: { qrTagId: 1 } });
  },
};

module.exports = qrService;
