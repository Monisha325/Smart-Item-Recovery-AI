const { success } = require('../utils/apiResponse');
const authService = require('../services/authService');

const authController = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      return success(res, result, 'Registration successful', 201);
    } catch (err) { next(err); }
  },

  login: async (req, res, next) => {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      return success(res, result, 'Login successful');
    } catch (err) { next(err); }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const result = await authService.verifyEmail(req.query.token);
      return success(res, result, 'Email verified successfully');
    } catch (err) { next(err); }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return success(res, result, result.message);
    } catch (err) { next(err); }
  },

  resetPassword: async (req, res, next) => {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      return success(res, result, result.message);
    } catch (err) { next(err); }
  },

  getMe: async (req, res, next) => {
    try {
      const user = await authService.getMe(req.user.userId);
      return success(res, user);
    } catch (err) { next(err); }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { name, campusId } = req.body;
      const user = await authService.updateProfile(req.user.userId, { name, campusId });
      return success(res, user, 'Profile updated');
    } catch (err) { next(err); }
  },

  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);
      return success(res, result, result.message);
    } catch (err) { next(err); }
  },

  getMyStats: async (req, res, next) => {
    try {
      const stats = await authService.getMyStats(req.user.userId);
      return success(res, stats);
    } catch (err) { next(err); }
  },
};

module.exports = authController;
