const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authJwt } = require('../middleware');

// User routes
router.get('/servers/available', [authJwt.verifyToken], subscriptionController.getAvailableServers);
router.get('/user', [authJwt.verifyToken], subscriptionController.getUserSubscriptions);
router.post('/subscribe', [authJwt.verifyToken], subscriptionController.initiateSubscription);

// Webhook
router.post('/webhook', express.raw({type: 'application/json'}), subscriptionController.handlePaymentSuccess);

// Admin routes
router.get('/admin/all', [authJwt.verifyToken, authJwt.isAdmin], subscriptionController.getAllSubscriptions);
router.delete('/admin/:id/cancel', [authJwt.verifyToken, authJwt.isAdmin], subscriptionController.cancelSubscription);

module.exports = router;