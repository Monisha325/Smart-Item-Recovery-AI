const Notification     = require('../models/Notification');
const notificationRepo = require('../repositories/notificationRepo');
const logger           = require('../utils/logger');

const notificationService = {
  // Fire-and-forget: callers do not await this
  createNotification: async (userId, type, message, relatedItemId = null, relatedMatchId = null) => {
    try {
      await notificationRepo.create({ userId, type, message, relatedItemId, relatedMatchId });
    } catch (err) {
      logger.warn('createNotification failed:', err.message);
    }
  },

  getNotifications: async (userId, { unreadOnly = false, page = 1, limit = 20 } = {}) => {
    page  = Math.max(1, Number(page));
    limit = Math.min(50, Math.max(1, Number(limit)));
    const skip   = (page - 1) * limit;
    const filter = { userId };
    if (unreadOnly) filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    return {
      notifications,
      total,
      hasMore: skip + notifications.length < total,
    };
  },

  getUnreadCount: async (userId) => notificationRepo.unreadCount(userId),

  markAsRead: async (userId, notificationId) => {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) {
      const err = new Error('Notification not found'); err.statusCode = 404; throw err;
    }
    if (String(notification.userId) !== String(userId)) {
      const err = new Error('Not authorized'); err.statusCode = 403; throw err;
    }
    return notificationRepo.markAsRead(notificationId);
  },

  markAllAsRead: async (userId) => notificationRepo.markAllAsRead(userId),
};

module.exports = notificationService;
