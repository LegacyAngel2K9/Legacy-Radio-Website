const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authJwt } = require('../middleware');

// Subscription routes
router.get('/plans', subscriptionController.getSubscriptionPlans);
router.get('/my-subscription', [authJwt.verifyToken], subscriptionController.getUserSubscription);
router.post('/subscribe', [authJwt.verifyToken], subscriptionController.createSubscription);
router.post('/cancel', [authJwt.verifyToken], subscriptionController.cancelSubscription);
router.post('/webhook/stripe', subscriptionController.stripeWebhook);
router.post('/webhook/paypal', subscriptionController.paypalWebhook);

module.exports = router;
