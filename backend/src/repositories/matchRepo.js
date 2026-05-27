const Match = require('../models/Match');

const matchRepo = {
  create:     (data) => Match.create(data),

  findById:   (id) =>
    Match.findById(id).populate('lostItemId foundItemId'),

  updateById: (id, update) =>
    Match.findByIdAndUpdate(id, update, { new: true }),

  findAll:    (filter = {}, options = {}) =>
    Match.find(filter, null, options)
      .populate('lostItemId foundItemId')
      .sort({ createdAt: -1 }),

  findByItem: (itemId) =>
    Match.find({ $or: [{ lostItemId: itemId }, { foundItemId: itemId }] })
      .populate('lostItemId foundItemId'),

  findPending: () =>
    Match.find({ status: 'PENDING' }).populate('lostItemId foundItemId'),

  count:      (filter = {}) => Match.countDocuments(filter),

  upsertForPair: (lostItemId, foundItemId, data) =>
    Match.findOneAndUpdate(
      { lostItemId, foundItemId },
      { $set: data },
      { new: true, upsert: true }
    ),

  deleteByItem: (itemId) =>
    Match.deleteMany({ $or: [{ lostItemId: itemId }, { foundItemId: itemId }] }),
};

module.exports = matchRepo;
