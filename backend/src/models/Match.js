const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  lostItemId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  confidenceScore: { type: Number, required: true, min: 0, max: 100 },
  breakdown: {
    semantic:    Number,
    category:    Number,
    geo:         Number,
    color:       Number,
    imageLabels: Number,
  },
  status:      { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  notifiedAt:  { type: Date },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Match', matchSchema);
