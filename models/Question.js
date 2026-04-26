const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  userAnswer: { type: String, default: '' },
  aiScore: { type: Number, default: null, min: 0, max: 10 },
  aiFeedback: { type: String, default: '' },
  category: { type: String, default: 'general' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  note: { type: String, default: '' },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
