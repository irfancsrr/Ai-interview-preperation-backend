const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  extractedText: { type: String, default: '' },
  targetRole: { type: String, default: '' },
  analysis: {
    overallScore: { type: Number, default: null },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    keywordMatch: {
      found: { type: [String], default: [] },
      missing: { type: [String], default: [] },
    },
    formattingScore: { type: Number, default: null },
    contentScore: { type: Number, default: null },
    experienceScore: { type: Number, default: null },
  },
  status: { type: String, enum: ['uploaded', 'processing', 'analyzed', 'failed'], default: 'uploaded' },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
