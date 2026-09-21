const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'accessories', 'documents', 'bags', 'others'],
    required: true,
  },
  type:   { type: String, enum: ['lost', 'found'], required: true },
  status: {
    type: String,
    enum: ['LOST', 'FOUND', 'POTENTIAL_MATCH', 'CLAIMED', 'RETURNED', 'ARCHIVED'],
  },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images:   [{ url: String, publicId: String }],
  location: { name: String, lat: Number, lng: Number },
  color:    { type: String },
  embeddingVector: [Number],
  imageLabels:     [String],
  qrTagId:  { type: mongoose.Schema.Types.ObjectId, ref: 'QRTag' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Set default status from type before validation so it passes the enum check.
itemSchema.pre('validate', function (next) {
  if (!this.status && this.type) {
    this.status = this.type === 'lost' ? 'LOST' : 'FOUND';
  }
  next();
});

itemSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
