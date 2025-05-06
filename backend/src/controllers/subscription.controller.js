const db = require('../models');
const Subscription = db.subscriptions;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');

// PayPal client setup
const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// Subscription plans data
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Basic VoIP', 'Limited to 10 calls per day', '1 device'],
    stripePriceId: '',
    paypalPlanId: ''
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    features: ['Unlimited VoIP', 'Group calls (up to 3 people)', '2 devices'],
    stripePriceId: 'price_basic123',
    paypalPlanId: 'P-basic123'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    features: ['Unlimited VoIP', 'Group calls (up to 10 people)', '5 devices', 'Priority support'],
    stripePriceId: 'price_premium123',
    paypalPlanId: 'P-premium123'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    features: ['Unlimited VoIP', 'Unlimited group calls', 'Unlimited devices', 'Admin panel', '24/7 support'],
    stripePriceId: 'price_enterprise123',
    paypalPlanId: 'P-enterprise123'
  }
];

exports.getSubscriptionPlans = (req, res) => {
  res.status(200).json(subscriptionPlans);
};

exports.getUserSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.userId }
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Find the plan details to include in response
    const planDetails = subscriptionPlans.find(plan => plan.id === subscription.plan);

    res.status(200).json({
      ...subscription.toJSON(),
      planDetails
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving subscription."
    });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    // Validate request
    if (!req.body.planId || !req.body.paymentMethod) {
      return res.status(400).json({ message: "Plan ID and payment method are required!" });
    }

    const plan = subscriptionPlans.find(p => p.id === req.body.planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected!" });
    }

    // Check if user already has a subscription
    let subscription = await Subscription.findOne({
      where: { userId: req.userId }
    });

    let paymentId = '';

    // Process payment based on method
    if (req.body.paymentMethod === 'stripe' && plan.price > 0) {
      // Here you would integrate with Stripe to create a subscription
      // This is simplified for the example
      paymentId = 'stripe_' + Date.now();
    } else if (req.body.paymentMethod === 'paypal' && plan.price > 0) {
      // Here you would integrate with PayPal to create a subscription
      // This is simplified for the example
      paymentId = 'paypal_' + Date.now();
    } else if (plan.price === 0) {
      // Free plan
      paymentId = 'free';
    }

    // Create or update subscription
    if (subscription) {
      await Subscription.update({
        plan: req.body.planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        paymentMethod: plan.price > 0 ? req.body.paymentMethod : 'none',
        paymentId: paymentId
      }, {
        where: { userId: req.userId }
      });
    } else {
      await Subscription.create({
        userId: req.userId,
        plan: req.body.planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        paymentMethod: plan.price > 0 ? req.body.paymentMethod : 'none',
        paymentId: paymentId
      });
    }

    res.status(200).json({
      message: "Subscription created successfully!",
      plan: plan
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the subscription."
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.userId }
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Handle cancellation with payment provider if needed
    if (subscription.paymentMethod === 'stripe' && subscription.paymentId) {
      // Implement Stripe cancellation
    } else if (subscription.paymentMethod === 'paypal' && subscription.paymentId) {
      // Implement PayPal cancellation
    }

    // Update subscription status
    await Subscription.update({
      status: 'cancelled'
    }, {
      where: { userId: req.userId }
    });

    res.status(200).json({ message: "Subscription cancelled successfully" });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while cancelling the subscription."
    });
  }
};

exports.stripeWebhook = (req, res) => {
  // Handle Stripe webhook events
  const payload = req.body;
  
  // Implement webhook handling for subscription events
  
  res.status(200).json({ received: true });
};

exports.paypalWebhook = (req, res) => {
  // Handle PayPal webhook events
  const payload = req.body;
  
  // Implement webhook handling for subscription events
  
  res.status(200).json({ received: true });
};
