const User = require('../models/User');

const userRepo = {
  create:      (data) => User.create(data),

  findById:    (id, select = '-password -emailVerificationToken') =>
    User.findById(id).select(select),

  findByEmail: (email) =>
    User.findOne({ email: email.toLowerCase() }),

  findByVerificationToken: (token) =>
    User.findOne({ emailVerificationToken: token, emailVerificationExpires: { $gt: new Date() } }),

  updateById:  (id, update) =>
    User.findByIdAndUpdate(id, update, { new: true, runValidators: true }),

  findAll:     (filter = {}, options = {}) =>
    User.find(filter, '-password -emailVerificationToken', options),

  count:       (filter = {}) => User.countDocuments(filter),

  findByIdWithPassword: (id) => User.findById(id),

  deleteById:  (id) => User.findByIdAndDelete(id),
};

module.exports = userRepo;
