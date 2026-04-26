const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
