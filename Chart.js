const mongoose = require('mongoose');
const chartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  filePath: String,
  patterns: [{ name: String, confidence: String, meta: Object }],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Chart', chartSchema);
