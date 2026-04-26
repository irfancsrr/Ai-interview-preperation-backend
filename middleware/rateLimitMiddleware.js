const DailyUsage = require('../models/DailyUsage');

const FREE_DAILY_LIMIT = 5;

const rateLimitMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user.isPremium) {
      return next();
    }

      const today = new Date().toISOString().split('T')[0];
      let usage = await DailyUsage.findOne({ user: req.user._id, date: today });

    if (!usage) {
      usage = await DailyUsage.create({ user: req.user._id, date: today });
    }

    if (usage.questionsGenerated >= FREE_DAILY_LIMIT) {
      return res.status(429).json({
        message: 'Daily limit reached. Upgrade to Premium for unlimited access.',
        remaining: 0,
        limit: FREE_DAILY_LIMIT,
      });
    }

    req.dailyUsage = usage;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error checking usage limits.' });
  }
};

module.exports = rateLimitMiddleware;
