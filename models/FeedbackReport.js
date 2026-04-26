const mongoose = require('mongoose');

const feedbackReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, refPath: 'sessionModel' },
  sessionModel: { type: String, enum: ['Session', 'VideoInterview'], default: 'Session' },
  sessionType: { type: String, enum: ['practice', 'video', 'resume'], required: true },
  overallScore: { type: Number, default: 0, min: 0, max: 100 },
  summary: { type: String, default: '' },
  strengths: { type: [String], default: [] },
  areasForImprovement: { type: [String], default: [] },
  recommendations: { type: [String], default: [] },
  detailedBreakdown: [{
    category: { type: String },
    score: { type: Number },
    feedback: { type: String },
  }],
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('FeedbackReport', feedbackReportSchema);
