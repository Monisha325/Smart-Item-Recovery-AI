const { success } = require('../utils/apiResponse');
const qrService   = require('../services/qrService');

const qrController = {
  generateQRTag: async (req, res, next) => {
    try {
      const result = await qrService.generateQRTag(req.user.userId, req.body.itemId);
      return success(res, result, 'QR tag generated', 201);
    } catch (err) { next(err); }
  },

  getQRTagForItem: async (req, res, next) => {
    try {
      const result = await qrService.getQRTagForItem(req.params.itemId, req.user.userId);
      return success(res, result);
    } catch (err) { next(err); }
  },

  scanQRTag: async (req, res, next) => {
    try {
      const result = await qrService.handleQRScan(req.params.token);
      return success(res, result);
    } catch (err) { next(err); }
  },

  deleteQRTag: async (req, res, next) => {
    try {
      await qrService.deleteQRTag(req.params.itemId, req.user.userId);
      return success(res, null, 'QR tag deleted');
    } catch (err) { next(err); }
  },
};

module.exports = qrController;
