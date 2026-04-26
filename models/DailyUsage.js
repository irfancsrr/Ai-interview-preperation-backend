const mongoose = require('mongoose');

const dailyUsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  questionsGenerated: { type: Number, default: 0 },
  sessionsCreated: { type: Number, default: 0 },
}, { timestamps: true });

dailyUsageSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyUsage', dailyUsageSchema);
