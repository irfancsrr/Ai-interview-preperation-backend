const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true, trim: true },
  experience: { type: String, required: true },
  topicsToFocus: { type: [String], default: [] },
  description: { type: String, default: '' },
  sessionType: { type: String, enum: ['practice', 'video'], default: 'practice' },
  score: { type: Number, default: null, min: 0, max: 100 },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  completedAt: { type: Date, default: null },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
