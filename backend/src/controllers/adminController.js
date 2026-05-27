const { success } = require('../utils/apiResponse');
const adminService = require('../services/adminService');

const adminController = {
  getStats: async (req, res, next) => {
    try {
      const stats = await adminService.getStats();
      return success(res, stats);
    } catch (err) { next(err); }
  },

  getUsers: async (req, res, next) => {
    try {
      const { page, limit, search } = req.query;
      const result = await adminService.getUsers({ page, limit, search });
      return success(res, result);
    } catch (err) { next(err); }
  },

  toggleBanUser: async (req, res, next) => {
    try {
      const user = await adminService.toggleBanUser(req.params.id, req.user.userId);
      const msg  = user.isBanned ? 'User banned' : 'User unbanned';
      return success(res, user, msg);
    } catch (err) { next(err); }
  },

  getItems: async (req, res, next) => {
    try {
      const { page, limit, type, status, category } = req.query;
      const result = await adminService.getItems({ page, limit, type, status, category });
      return success(res, result);
    } catch (err) { next(err); }
  },

  deleteItem: async (req, res, next) => {
    try {
      await adminService.adminDeleteItem(req.params.id);
      return success(res, null, 'Item deleted');
    } catch (err) { next(err); }
  },

  getMatches: async (req, res, next) => {
    try {
      const { page, limit, status } = req.query;
      const result = await adminService.getMatches({ page, limit, status });
      return success(res, result);
    } catch (err) { next(err); }
  },
};

module.exports = adminController;
