const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, isPremium: user.isPremium, profileImageUrl: user.profileImageUrl },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
      user.isPremium = false;
      user.premiumExpiresAt = null;
      await user.save();
    }
    const token = generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, isPremium: user.isPremium, profileImageUrl: user.profileImageUrl, premiumExpiresAt: user.premiumExpiresAt },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      _id: user._id, name: user.name, email: user.email, isPremium: user.isPremium,
      profileImageUrl: user.profileImageUrl, premiumExpiresAt: user.premiumExpiresAt, createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }
    const imageUrl = `/uploads/images/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { profileImageUrl: imageUrl });
    res.json({ profileImageUrl: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
