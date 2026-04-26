const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const { createSession, getMySessions, getSession, completeSession, deleteSession } = require('../controllers/sessionController');

router.post('/create', authMiddleware, rateLimitMiddleware, createSession);
router.get('/my-sessions', authMiddleware, getMySessions);
router.get('/:id', authMiddleware, getSession);
router.put('/:id/complete', authMiddleware, completeSession);
router.delete('/:id', authMiddleware, deleteSession);

module.exports = router;
