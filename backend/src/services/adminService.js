const User  = require('../models/User');
const Item  = require('../models/Item');
const Match = require('../models/Match');
const cloudinary       = require('../config/cloudinary');
const itemRepo         = require('../repositories/itemRepo');
const matchRepo        = require('../repositories/matchRepo');
const notificationRepo = require('../repositories/notificationRepo');

function apiErr(msg, code = 400) {
  const e = new Error(msg);
  e.statusCode = code;
  return e;
}

const adminService = {
  async getStats() {
    const [
      totalUsers,
      totalItems,
      totalLost,
      totalFound,
      totalMatches,
      totalClaimed,
      totalReturned,
      itemsByCategory,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Match.countDocuments(),
      Item.countDocuments({ status: 'CLAIMED' }),
      Item.countDocuments({ status: 'RETURNED' }),
      Item.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Item.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .lean(),
    ]);

    return {
      totalUsers,
      totalItems,
      totalLost,
      totalFound,
      totalMatches,
      totalClaimed,
      totalReturned,
      itemsByCategory,
      recentActivity,
    };
  },

  async getUsers({ page = 1, limit = 20, search } = {}) {
    page  = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      const rx = { $regex: search, $options: 'i' };
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter, '-password -emailVerificationToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  },

  async toggleBanUser(targetUserId, adminUserId) {
    const target = await User.findById(targetUserId).lean();
    if (!target) throw apiErr('User not found', 404);
    if (target.role === 'admin') throw apiErr('Cannot ban another admin', 403);

    const updated = await User.findByIdAndUpdate(
      targetUserId,
      { $set: { isBanned: !target.isBanned } },
      { new: true }
    ).select('-password -emailVerificationToken');

    return updated;
  },

  async getItems({ page = 1, limit = 20, type, status, category } = {}) {
    page  = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (type)     filter.type     = type;
    if (status)   filter.status   = status;
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('userId', 'name email campusId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(filter),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  },

  async adminDeleteItem(itemId) {
    const item = await Item.findById(itemId).lean();
    if (!item) throw apiErr('Item not found', 404);

    if (item.images?.length) {
      await Promise.allSettled(
        item.images.map(img => cloudinary.uploader.destroy(img.publicId))
      );
    }

    await Promise.all([
      itemRepo.delete(itemId),
      matchRepo.deleteByItem(itemId),
      notificationRepo.deleteByItem(itemId),
    ]);
  },

  async getMatches({ page = 1, limit = 20, status } = {}) {
    page  = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const [matches, total] = await Promise.all([
      Match.find(filter)
        .populate('lostItemId foundItemId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Match.countDocuments(filter),
    ]);

    return { matches, total, page, totalPages: Math.ceil(total / limit) };
  },
};

module.exports = adminService;
