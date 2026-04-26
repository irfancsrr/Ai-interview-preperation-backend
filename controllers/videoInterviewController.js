const VideoInterview = require('../models/VideoInterview');
const geminiService = require('../services/geminiService');
const FeedbackReport = require('../models/FeedbackReport');

exports.startInterview = async (req, res) => {
  try {
    const { role, experience, interviewType } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required.' });

    const interview = await VideoInterview.create({
      user: req.user._id,
      role,
      experience: experience || 'mid-level',
      interviewType: interviewType || 'mixed',
    });

    const firstQuestion = await geminiService.generateVideoQuestion(
      role, experience || 'mid-level', interviewType || 'mixed', []
    );

    interview.questions.push({
      question: firstQuestion.question,
      userTranscript: '',
      aiScore: null,
      aiFeedback: '',
    });
    await interview.save();

    res.status(201).json({
      interviewId: interview._id,
      question: firstQuestion.question,
      questionIndex: 0,
      expectedTopics: firstQuestion.expectedTopics || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start interview.', error: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { questionIndex, transcript } = req.body;
    const interview = await VideoInterview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });

    if (questionIndex >= interview.questions.length) {
      return res.status(400).json({ message: 'Invalid question index.' });
    }

    const currentQ = interview.questions[questionIndex];
    const evaluation = await geminiService.evaluateVideoAnswer(
      currentQ.question, transcript, []
    );

    interview.questions[questionIndex].userTranscript = transcript;
    interview.questions[questionIndex].aiScore = evaluation.score;
    interview.questions[questionIndex].aiFeedback = evaluation.feedback;
    await interview.save();

    res.json({
      score: evaluation.score,
      feedback: evaluation.feedback,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit answer.', error: error.message });
  }
};

exports.getNextQuestion = async (req, res) => {
  try {
    const interview = await VideoInterview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });

    if (interview.questions.length >= 8) {
      return res.json({ done: true, message: 'Interview complete. Please end the interview.' });
    }

    const previousQA = interview.questions.map(q => ({
      question: q.question,
      userTranscript: q.userTranscript,
    }));

    const nextQ = await geminiService.generateVideoQuestion(
      interview.role, interview.experience, interview.interviewType, previousQA
    );

    interview.questions.push({
      question: nextQ.question,
      userTranscript: '',
      aiScore: null,
      aiFeedback: '',
    });
    await interview.save();

    res.json({
      question: nextQ.question,
      questionIndex: interview.questions.length - 1,
      expectedTopics: nextQ.expectedTopics || [],
      totalQuestions: interview.questions.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get next question.', error: error.message });
  }
};

exports.endInterview = async (req, res) => {
  try {
    const interview = await VideoInterview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });

    const scoredQs = interview.questions.filter(q => q.aiScore !== null);
    const overallScore = scoredQs.length > 0
      ? Math.round(scoredQs.reduce((s, q) => s + q.aiScore, 0) / scoredQs.length * 10)
      : 0;

    interview.overallScore = overallScore;
    interview.status = 'completed';
    interview.completedAt = new Date();

    try {
      const feedbackData = await geminiService.generateSessionFeedback(
        interview.role, interview.experience,
        interview.questions.map(q => ({ question: q.question, userAnswer: q.userTranscript, aiScore: q.aiScore }))
      );
      interview.overallFeedback = feedbackData.summary || '';

      await FeedbackReport.create({
        user: req.user._id,
        session: interview._id,
        sessionModel: 'VideoInterview',
        sessionType: 'video',
        overallScore: feedbackData.overallScore || overallScore,
        summary: feedbackData.summary || '',
        strengths: feedbackData.strengths || [],
        areasForImprovement: feedbackData.areasForImprovement || [],
        recommendations: feedbackData.recommendations || [],
        detailedBreakdown: feedbackData.detailedBreakdown || [],
      });
    } catch (fbErr) {
      console.error('Failed to generate feedback report:', fbErr.message);
    }

    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to end interview.', error: error.message });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const interview = await VideoInterview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview.', error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const interviews = await VideoInterview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview history.', error: error.message });
  }
};
