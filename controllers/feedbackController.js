const FeedbackReport = require('../models/FeedbackReport');
const Session = require('../models/Session');
const geminiService = require('../services/geminiService');

exports.getFeedback = async (req, res) => {
  try {
    const report = await FeedbackReport.findOne({ session: req.params.sessionId, user: req.user._id });
    if (!report) return res.status(404).json({ message: 'Feedback report not found.' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback.', error: error.message });
  }
};

exports.generateFeedback = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id }).populate('questions');
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const existing = await FeedbackReport.findOne({ session: session._id, user: req.user._id });
    if (existing) return res.json(existing);

    const feedbackData = await geminiService.generateSessionFeedback(
      session.role, session.experience,
      session.questions.map(q => ({ question: q.question, userAnswer: q.userAnswer, aiScore: q.aiScore }))
    );

    const report = await FeedbackReport.create({
      user: req.user._id,
      session: session._id,
      sessionModel: 'Session',
      sessionType: 'practice',
      overallScore: feedbackData.overallScore || session.score || 0,
      summary: feedbackData.summary || '',
      strengths: feedbackData.strengths || [],
      areasForImprovement: feedbackData.areasForImprovement || [],
      recommendations: feedbackData.recommendations || [],
      detailedBreakdown: feedbackData.detailedBreakdown || [],
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate feedback.', error: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const reports = await FeedbackReport.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback reports.', error: error.message });
  }
};
