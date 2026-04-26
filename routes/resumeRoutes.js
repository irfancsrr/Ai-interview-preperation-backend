const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const premiumMiddleware = require('../middleware/premiumMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');
const { upload, getMyResumes, getResume, deleteResume } = require('../controllers/resumeController');

router.post('/upload', authMiddleware, premiumMiddleware, uploadResume.single('resume'), upload);
router.get('/my-resumes', authMiddleware, premiumMiddleware, getMyResumes);
router.get('/:id', authMiddleware, premiumMiddleware, getResume);
router.delete('/:id', authMiddleware, premiumMiddleware, deleteResume);

module.exports = router;
