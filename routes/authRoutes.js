const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');
const { register, login, getProfile, updateProfile, uploadProfileImage } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/upload-image', authMiddleware, uploadImage.single('profileImage'), uploadProfileImage);

module.exports = router;
