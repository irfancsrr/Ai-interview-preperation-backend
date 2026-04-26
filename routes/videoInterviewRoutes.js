const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const premiumMiddleware = require('../middleware/premiumMiddleware');
const { startInterview, submitAnswer, getNextQuestion, endInterview, getInterview, getHistory } = require('../controllers/videoInterviewController');

router.post('/start', authMiddleware, premiumMiddleware, startInterview);
router.get('/history', authMiddleware, premiumMiddleware, getHistory);
router.get('/:id', authMiddleware, premiumMiddleware, getInterview);
router.post('/:id/answer', authMiddleware, premiumMiddleware, submitAnswer);
router.post('/:id/next', authMiddleware, premiumMiddleware, getNextQuestion);
router.post('/:id/end', authMiddleware, premiumMiddleware, endInterview);

module.exports = router;
