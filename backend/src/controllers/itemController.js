const { success } = require('../utils/apiResponse');
const itemService = require('../services/itemService');

const itemController = {
  getItems: async (req, res, next) => {
    try {
      const result = await itemService.getItems(req.query);
      return success(res, result);
    } catch (err) { next(err); }
  },

  getItemById: async (req, res, next) => {
    try {
      const result = await itemService.getItemById(req.params.id);
      return success(res, result);
    } catch (err) { next(err); }
  },

  createItem: async (req, res, next) => {
    try {
      const result = await itemService.createItem(req.user.userId, req.body, req.files);
      return success(res, result, 'Item created', 201);
    } catch (err) { next(err); }
  },

  updateItem: async (req, res, next) => {
    try {
      const result = await itemService.updateItem(req.user.userId, req.params.id, req.body, req.user.role);
      return success(res, result, 'Item updated');
    } catch (err) { next(err); }
  },

  deleteItem: async (req, res, next) => {
    try {
      await itemService.deleteItem(req.user.userId, req.params.id, req.user.role);
      return success(res, null, 'Item deleted');
    } catch (err) { next(err); }
  },

  getMyItems: async (req, res, next) => {
    try {
      const result = await itemService.getItemsByUser(req.user.userId, req.query);
      return success(res, result);
    } catch (err) { next(err); }
  },
};

module.exports = itemController;
