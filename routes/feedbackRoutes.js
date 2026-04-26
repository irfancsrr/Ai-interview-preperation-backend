const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const premiumMiddleware = require('../middleware/premiumMiddleware');
const { getFeedback, generateFeedback, getAllFeedback } = require('../controllers/feedbackController');

router.get('/all', authMiddleware, premiumMiddleware, getAllFeedback);
router.get('/:sessionId', authMiddleware, getFeedback);
router.post('/:sessionId/generate', authMiddleware, premiumMiddleware, generateFeedback);

module.exports = router;
