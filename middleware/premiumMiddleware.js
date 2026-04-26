const User = require('../models/User');

const premiumMiddleware = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
      await User.findByIdAndUpdate(user._id, { isPremium: false, premiumExpiresAt: null });
      return res.status(403).json({
        message: 'Your premium subscription has expired.',
        upgradeUrl: '/pricing',
      });
    }

    if (!user.isPremium) {
      return res.status(403).json({
        message: 'Premium subscription required to access this feature.',
        upgradeUrl: '/pricing',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error checking subscription.' });
  }
};

module.exports = premiumMiddleware;
