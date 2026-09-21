const QRTag = require('../models/QRTag');

const qrRepo = {
  create:      (data) => QRTag.create(data),

  findById:    (id) =>
    QRTag.findById(id).populate('itemId userId'),

  findByToken: (token) =>
    QRTag.findOne({ token }).populate('itemId userId'),

  findByItem:  (itemId) =>
    QRTag.findOne({ itemId }),

  updateById:  (id, update) =>
    QRTag.findByIdAndUpdate(id, update, { new: true }),

  incrementScan: (id) =>
    QRTag.findByIdAndUpdate(
      id,
      { $inc: { scannedCount: 1 }, $set: { lastScannedAt: new Date() } },
      { new: true }
    ),

  deleteById:  (id) => QRTag.findByIdAndDelete(id),
};

module.exports = qrRepo;
