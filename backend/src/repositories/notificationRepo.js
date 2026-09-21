const Notification = require('../models/Notification');

const notificationRepo = {
  create:      (data) => Notification.create(data),

  findById:    (id) => Notification.findById(id),

  findByUser:  (userId, limit = 50) =>
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit),

  markAsRead:  (id) =>
    Notification.findByIdAndUpdate(id, { isRead: true }, { new: true }),

  markAllAsRead: (userId) =>
    Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } }),

  unreadCount: (userId) =>
    Notification.countDocuments({ userId, isRead: false }),

  count:       (filter = {}) => Notification.countDocuments(filter),

  deleteById:  (id) => Notification.findByIdAndDelete(id),

  deleteByItem: (itemId) =>
    Notification.deleteMany({ relatedItemId: itemId }),
};

module.exports = notificationRepo;
