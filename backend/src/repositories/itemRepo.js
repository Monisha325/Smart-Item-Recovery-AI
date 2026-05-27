const Item = require('../models/Item');

const itemRepo = {
  create: (data) => Item.create(data),

  findById: (id) =>
    Item.findById(id).populate('userId', 'name campusId'),

  async findMany({ type, category, status, search, page = 1, limit = 20 }) {
    page  = Math.max(1, Number(page));
    limit = Math.min(50, Math.max(1, Number(limit)));
    const skip = (page - 1) * limit;

    const baseFilter = {};
    if (type)     baseFilter.type     = type;
    if (category) baseFilter.category = category;
    if (status)   baseFilter.status   = status;

    if (search) {
      const textFilter = { ...baseFilter, $text: { $search: search } };
      try {
        const [items, total] = await Promise.all([
          Item.find(textFilter)
            .populate('userId', 'name campusId')
            .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
            .skip(skip)
            .limit(limit),
          Item.countDocuments(textFilter),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limit) };
      } catch {
        // Text index not yet built — fall back to case-insensitive regex
        const rx = { $regex: search, $options: 'i' };
        baseFilter.$or = [{ title: rx }, { description: rx }];
      }
    }

    const [items, total] = await Promise.all([
      Item.find(baseFilter)
        .populate('userId', 'name campusId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Item.countDocuments(baseFilter),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  },

  async findByUser(userId, page = 1, limit = 20) {
    page  = Math.max(1, Number(page));
    limit = Math.min(50, Math.max(1, Number(limit)));
    const [items, total] = await Promise.all([
      Item.find({ userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Item.countDocuments({ userId }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  },

  // Applies a ±0.5° geo box (~55 km) before service-layer Haversine scoring.
  findCandidatesForMatching: (oppositeType, category, lat, lng, createdAfter) => {
    const filter = {
      type:      oppositeType,
      status:    { $ne: 'ARCHIVED' },
      createdAt: { $gte: createdAfter },
    };
    if (category) filter.category = category;
    if (lat != null && lng != null) {
      filter['location.lat'] = { $gte: lat - 0.5, $lte: lat + 0.5 };
      filter['location.lng'] = { $gte: lng - 0.5, $lte: lng + 0.5 };
    }
    return Item.find(filter).limit(200);
  },

  update: (id, data) =>
    Item.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedAt: new Date() } },
      { new: true }
    ),

  delete: (id) => Item.findByIdAndDelete(id),
};

module.exports = itemRepo;
