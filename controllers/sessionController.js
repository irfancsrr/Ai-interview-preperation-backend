const Session = require('../models/Session');
const Question = require('../models/Question');
const geminiService = require('../services/geminiService');
const DailyUsage = require('../models/DailyUsage');

exports.createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description } = req.body;
    if (!role || !experience) {
      return res.status(400).json({ message: 'Role and experience are required.' });
    }

    const questionsData = await geminiService.generateQuestions(role, experience, topicsToFocus || [], 5);

    const session = await Session.create({
      user: req.user._id, role, experience,
      topicsToFocus: topicsToFocus || [], description: description || '',
    });

    const questions = await Question.insertMany(
      questionsData.map(q => ({
        session: session._id, question: q.question, answer: q.answer,
        category: q.category || 'general', difficulty: q.difficulty || 'medium',
      }))
    );

    session.questions = questions.map(q => q._id);
    await session.save();

    // Track usage for free users
    if (!req.user.isPremium) {
      const today = new Date().toISOString().split('T')[0];
      await DailyUsage.findOneAndUpdate(
        { user: req.user._id, date: today },
        { $inc: { questionsGenerated: questions.length, sessionsCreated: 1 } },
        { upsert: true }
      );
    }

    const populatedSession = await Session.findById(session._id).populate('questions');
    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session.', error: error.message });
  }
};

exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('questions');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions.', error: error.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id }).populate('questions');
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch session.', error: error.message });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id }).populate('questions');
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const scoredQuestions = session.questions.filter(q => q.aiScore !== null);
    const avgScore = scoredQuestions.length > 0
      ? Math.round(scoredQuestions.reduce((sum, q) => sum + q.aiScore, 0) / scoredQuestions.length * 10)
      : 0;

    session.score = avgScore;
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete session.', error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    await Question.deleteMany({ session: session._id });
    res.json({ message: 'Session deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete session.', error: error.message });
  }
};
