const mongoose = require('mongoose');

const qrTagSchema = new mongoose.Schema({
  itemId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token:        { type: String, required: true, unique: true },
  scannedCount: { type: Number, default: 0 },
  lastScannedAt: { type: Date },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('QRTag', qrTagSchema);
