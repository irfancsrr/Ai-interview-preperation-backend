const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { submitAnswer, togglePin, updateNote } = require('../controllers/questionController');

router.post('/:id/answer', authMiddleware, submitAnswer);
router.post('/:id/pin', authMiddleware, togglePin);
router.post('/:id/note', authMiddleware, updateNote);

module.exports = router;
