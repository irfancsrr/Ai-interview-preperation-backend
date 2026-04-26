const mongoose = require('mongoose');

const videoQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userTranscript: { type: String, default: '' },
  aiScore: { type: Number, default: null, min: 0, max: 10 },
  aiFeedback: { type: String, default: '' },
  duration: { type: Number, default: 0 },
}, { _id: true });

const videoInterviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true, trim: true },
  experience: { type: String, default: '' },
  interviewType: { type: String, enum: ['technical', 'behavioral', 'mixed'], default: 'mixed' },
  questions: [videoQuestionSchema],
  overallScore: { type: Number, default: null, min: 0, max: 100 },
  overallFeedback: { type: String, default: '' },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('VideoInterview', videoInterviewSchema);
