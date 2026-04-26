const Question = require('../models/Question');
const geminiService = require('../services/geminiService');

exports.submitAnswer = async (req, res) => {
  try {
    const { userAnswer } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    if (!userAnswer || userAnswer.trim().length === 0) {
      return res.status(400).json({ message: 'Answer is required.' });
    }

    const evaluation = await geminiService.evaluateAnswer(question.question, question.answer, userAnswer);

    question.userAnswer = userAnswer;
    question.aiScore = evaluation.score;
    question.aiFeedback = evaluation.feedback;
    await question.save();

    res.json({
      score: evaluation.score,
      feedback: evaluation.feedback,
      keyPoints: evaluation.keyPoints || [],
      question: question,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to evaluate answer.', error: error.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    question.isPinned = !question.isPinned;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle pin.', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { note } = req.body;
    const question = await Question.findByIdAndUpdate(req.params.id, { note }, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note.', error: error.message });
  }
};
