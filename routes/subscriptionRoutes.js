const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getPlans, checkout, getStatus, cancel, checkoutByStripe, planId} = require('../controllers/subscriptionController');

router.get('/plans', getPlans);
router.post('/checkout', authMiddleware, checkout);
router.post('/planId', authMiddleware, planId);

router.post('/checkoutByStripe', authMiddleware, checkoutByStripe);
router.get('/status', authMiddleware, getStatus);
router.post('/cancel', authMiddleware, cancel);

module.exports = router;
