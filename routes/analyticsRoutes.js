const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const premiumMiddleware = require('../middleware/premiumMiddleware');
const { getOverview, getProgress, getStrengths, getHistory } = require('../controllers/analyticsController');

router.get('/overview', authMiddleware, getOverview);
router.get('/progress', authMiddleware, premiumMiddleware, getProgress);
router.get('/strengths', authMiddleware, premiumMiddleware, getStrengths);
router.get('/history', authMiddleware, getHistory);

module.exports = router;
