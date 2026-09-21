const { success } = require('../utils/apiResponse');
const matchService = require('../services/matchService');

const matchController = {
  getMyMatches: async (req, res, next) => {
    try {
      const result = await matchService.getMyMatches(req.user.userId);
      return success(res, result);
    } catch (err) { next(err); }
  },

  getMatchesForItem: async (req, res, next) => {
    try {
      const result = await matchService.getMatchesForItem(req.params.itemId);
      return success(res, result);
    } catch (err) { next(err); }
  },

  acceptMatch: async (req, res, next) => {
    try {
      const result = await matchService.acceptMatch(req.params.id, req.user.userId);
      return success(res, result, 'Match accepted');
    } catch (err) { next(err); }
  },

  rejectMatch: async (req, res, next) => {
    try {
      const result = await matchService.rejectMatch(req.params.id, req.user.userId);
      return success(res, result, 'Match rejected');
    } catch (err) { next(err); }
  },

  // Admin — trigger matching manually for a given item
  triggerMatching: async (req, res, next) => {
    try {
      await matchService.triggerMatchingForItem(req.body.itemId);
      return success(res, null, 'Matching triggered');
    } catch (err) { next(err); }
  },
};

module.exports = matchController;
