const Session = require('../models/Session');
const VideoInterview = require('../models/VideoInterview');
const Question = require('../models/Question');

exports.getOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const [practiceSessions, videoInterviews] = await Promise.all([
      Session.find({ user: userId }),
      VideoInterview.find({ user: userId }),
    ]);

    const allSessions = [...practiceSessions, ...videoInterviews];
    const completed = allSessions.filter(s => s.status === 'completed');
    const scores = completed.filter(s => s.score || s.overallScore).map(s => s.score || s.overallScore);

    res.json({
      totalSessions: allSessions.length,
      completedSessions: completed.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      totalPracticeSessions: practiceSessions.length,
      totalVideoInterviews: videoInterviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch overview.', error: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await Session.find({ user: userId, status: 'completed' }).sort({ completedAt: 1 });
    const videos = await VideoInterview.find({ user: userId, status: 'completed' }).sort({ completedAt: 1 });

    const progressData = [];
    const allCompleted = [
      ...sessions.map(s => ({ date: s.completedAt || s.createdAt, score: s.score, type: 'practice' })),
      ...videos.map(v => ({ date: v.completedAt || v.createdAt, score: v.overallScore, type: 'video' })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    allCompleted.forEach(item => {
      progressData.push({
        date: item.date ? new Date(item.date).toLocaleDateString() : 'N/A',
        score: item.score || 0,
        type: item.type,
      });
    });

    res.json(progressData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch progress.', error: error.message });
  }
};

exports.getStrengths = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await Session.find({ user: userId }).select('_id');
    const sessionIds = sessions.map(s => s._id);
    const questions = await Question.find({ session: { $in: sessionIds }, aiScore: { $ne: null } });

    const categoryMap = {};
    questions.forEach(q => {
      const cat = q.category || 'general';
      if (!categoryMap[cat]) categoryMap[cat] = { totalScore: 0, count: 0 };
      categoryMap[cat].totalScore += q.aiScore;
      categoryMap[cat].count += 1;
    });

    const categories = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      avgScore: Math.round((data.totalScore / data.count) * 10) / 10,
      totalQuestions: data.count,
    })).sort((a, b) => b.avgScore - a.avgScore);

    res.json({
      strengths: categories.slice(0, 3),
      weaknesses: categories.slice(-3).reverse(),
      all: categories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch strengths.', error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [sessions, videos, totalSessions, totalVideos] = await Promise.all([
      Session.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).select('role score status sessionType createdAt completedAt'),
      VideoInterview.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).select('role overallScore status interviewType createdAt completedAt'),
      Session.countDocuments({ user: userId }),
      VideoInterview.countDocuments({ user: userId }),
    ]);

    const combined = [
      ...sessions.map(s => ({ ...s.toObject(), type: 'practice' })),
      ...videos.map(v => ({ ...v.toObject(), score: v.overallScore, type: 'video' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      sessions: combined.slice(0, limit),
      pagination: { page, totalPages: Math.ceil((totalSessions + totalVideos) / limit), total: totalSessions + totalVideos },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history.', error: error.message });
  }
};
