const { success }           = require('../utils/apiResponse');
const notificationService   = require('../services/notificationService');

const notificationController = {
  getNotifications: async (req, res, next) => {
    try {
      const { unreadOnly, page, limit } = req.query;
      const result = await notificationService.getNotifications(req.user.userId, {
        unreadOnly: unreadOnly === 'true',
        page:  Number(page)  || 1,
        limit: Number(limit) || 20,
      });
      return success(res, result);
    } catch (err) { next(err); }
  },

  getUnreadCount: async (req, res, next) => {
    try {
      const count = await notificationService.getUnreadCount(req.user.userId);
      return success(res, count);
    } catch (err) { next(err); }
  },

  markAsRead: async (req, res, next) => {
    try {
      const result = await notificationService.markAsRead(req.user.userId, req.params.id);
      return success(res, result, 'Notification marked as read');
    } catch (err) { next(err); }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      await notificationService.markAllAsRead(req.user.userId);
      return success(res, null, 'All notifications marked as read');
    } catch (err) { next(err); }
  },
};

module.exports = notificationController;
