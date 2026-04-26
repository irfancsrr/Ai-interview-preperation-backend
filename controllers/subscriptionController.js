const { v4: uuidv4 } = require('uuid');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Stripe=require('stripe');
const stripe=new Stripe(process.env.Stripe_private_key);


const PLANS = {
  monthly: { name: 'Monthly Premium',priceId:'price_1TGwk6IUS9rFyqdSvWTof84I', price: 999, duration: 30, features: ['unlimited_practice', 'video_interviews', 'analytics', 'resume_review', 'feedback_reports'] },
  yearly: { name: 'Yearly Premium',priceId:'price_1TGwkxIUS9rFyqdSScwfRflu', price: 7999, duration: 365, features: ['unlimited_practice', 'video_interviews', 'analytics', 'resume_review', 'feedback_reports'] },
};

exports.getPlans = (req, res) => {
  res.json({
    plans: [
      { id: 'free', name: 'Free', price: 0, period: 'forever', features: ['5 questions per day', 'Basic feedback', 'AI answer scoring'] },
      { id: 'monthly', name: 'Monthly Premium', price: 9.99, period: 'month', features: ['Unlimited practice', 'AI Video interviews', 'Detailed analytics', 'Resume review', 'Personalized feedback reports'] },
      { id: 'yearly', name: 'Yearly Premium', price: 79.99, period: 'year', savings: '33%', features: ['Unlimited practice', 'AI Video interviews', 'Detailed analytics', 'Resume review', 'Personalized feedback reports'] },
    ],
  });
};

exports.checkoutByStripe=async (req,res)=>{
 const {planId}=req.body;
  const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ message: 'Invalid plan selected.' });
 
 const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: plan.priceId, // Test Price ID
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/success?planId=${planId}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });
  res.json({url:session.url});
}

exports.planId=async (req,res)=>{
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ message: 'Invalid plan selected.' });

        const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan: planId,
      startDate,
      endDate,
      amount: plan.price,
      paymentId: uuidv4(),
      features: plan.features,
    });

    await User.findByIdAndUpdate(req.user._id, {
      isPremium: true,
      premiumExpiresAt: endDate,
      subscription: subscription._id,
    });

    res.json({
      message: 'Subscription activated successfully!',
      subscription: {
        plan: planId,
        status: 'active',
        startDate,
        endDate,
        paymentId: subscription.paymentId,
      },    
    });

  }
  catch (error){
    res.status(500).json({ message: 'Checkout failed.', error: error.message });
  
  }
}


exports.checkout = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ message: 'Invalid plan selected.' });

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1500));

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan: planId,
      startDate,
      endDate,
      amount: plan.price,
      paymentId: uuidv4(),
      features: plan.features,
    });

    await User.findByIdAndUpdate(req.user._id, {
      isPremium: true,
      premiumExpiresAt: endDate,
      subscription: subscription._id,
    });

    res.json({
      message: 'Subscription activated successfully!',
      subscription: {
        plan: planId,
        status: 'active',
        startDate,
        endDate,
        paymentId: subscription.paymentId,
      },    
    });
  } catch (error) {
    res.status(500).json({ message: 'Checkout failed.', error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    if (!subscription) {
      return res.json({ plan: 'free', isPremium: false });
    }
    if (new Date(subscription.endDate) < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
      await User.findByIdAndUpdate(req.user._id, { isPremium: false, premiumExpiresAt: null });
      return res.json({ plan: 'free', isPremium: false, expired: true });
    }
    res.json({
      plan: subscription.plan,
      isPremium: true,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      features: subscription.features,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscription status.', error: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!subscription) return res.status(404).json({ message: 'No active subscription found.' });

    subscription.status = 'cancelled';
    await subscription.save();

    if (new Date(subscription.endDate) < new Date()) {
      await User.findByIdAndUpdate(req.user._id, { isPremium: false, premiumExpiresAt: null });
    }

    res.json({ message: 'Subscription cancelled. Access continues until end date.', endDate: subscription.endDate });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel subscription.', error: error.message });
  }
};
