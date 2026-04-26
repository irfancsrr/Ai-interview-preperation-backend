const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'monthly', 'yearly'], required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  features: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
