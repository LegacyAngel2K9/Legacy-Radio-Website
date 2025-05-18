const db = require('../models');
const Subscription = db.Subscriptions;
const Server = db.Server;
const User = db.User;
const DiscountCode = db.DiscountCode;
const DiscountCodeUsage = db.DiscountCodeUsage;
const { Op } = require('sequelize');
const apiResponse = require('../utils/apiResponse');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getAvailableServers = async (req, res) => {
  try {
    // Get all servers that user doesn't have an active subscription for
    const subscribedServerIds = (await Subscription.findAll({
      where: {
        user_id: req.userId,
        expires_at: { [Op.gt]: new Date() }
      },
      attributes: ['server_id']
    })).map(sub => sub.server_id);

    const availableServers = await Server.findAll({
      where: {
        id: { [Op.notIn]: subscribedServerIds }
      }
    });

    apiResponse.success(res, {
      message: "Available servers fetched successfully",
      data: availableServers
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error fetching available servers",
      error: err.stack
    });
  }
};

exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      include: [
        { model: Server, as: 'server' }
      ],
      order: [['expires_at', 'DESC']]
    });

    apiResponse.success(res, {
      message: "User subscriptions fetched successfully",
      data: subscriptions
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error fetching user subscriptions",
      error: err.stack
    });
  }
};

exports.initiateSubscription = async (req, res) => {
  try {
    const { server_id, months, discount_code } = req.body;

    // Convert and validate input
    const errors = {};
    const monthsNum = parseInt(months, 10);
    const serverIdNum = parseInt(server_id, 10);

    if (!server_id || isNaN(serverIdNum) || serverIdNum <= 0) {
      errors.server_id = "Valid server ID required";
    }

    if (!months || isNaN(monthsNum) || ![1, 3, 6, 12].includes(monthsNum)) {
      errors.months = "Must be 1, 3, 6, or 12 months";
    }

    if (Object.keys(errors).length > 0) {
      return apiResponse.validationError(res, {
        status: false,
        message: "Invalid input",
        error: errors
      });
    }

    // Check if server exists
    const server = await Server.findByPk(serverIdNum);
    if (!server) {
      return apiResponse.error(res, {
        status: false,
        statusCode: 404,
        message: "Server not found"
      });
    }

    // Check for existing active subscription
    const existingSubscription = await Subscription.findOne({
      where: {
        user_id: req.userId,
        server_id: serverIdNum,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (existingSubscription) {
      return apiResponse.validationError(res, {
        status: false,
        message: "You already have an active subscription for this server"
      });
    }

    // Process discount code if provided
    let discountAmount = 0;
    let viaCoupon = false;

    if (discount_code) {
      const discountResult = await this.applyDiscountCode(req.userId, serverIdNum, discount_code);
      if (discountResult.error) {
        return apiResponse.validationError(res, {
          status: false,
          message: discountResult.error
        });
      }
      discountAmount = discountResult.discount || 0;
      viaCoupon = true;
    }

    // Calculate subscription details - ensure proper number handling
    const basePricePerMonth = 10; // $10/month
    const basePrice = monthsNum * basePricePerMonth;
    const finalPrice = Math.max(0, basePrice - (discountAmount || 0)); // Ensure non-negative

    // Validate final price
    if (isNaN(finalPrice) || finalPrice <= 0) {
      return apiResponse.error(res, {
        status: false,
        statusCode: 400,
        message: "Invalid subscription amount calculation"
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${server.name} (${monthsNum} month${monthsNum > 1 ? 's' : ''})`,
          },
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        user_id: req.userId.toString(),
        server_id: serverIdNum.toString(),
        months: monthsNum.toString(),
        discount_code: discount_code || '',
        via_coupon: viaCoupon.toString()
      }
    });

    // Enhanced response with checkout URL
    apiResponse.success(res, {
      status: true,
      message: "Checkout session created",
      data: {
        sessionId: session.id,
        checkoutUrl: session.url, // The Stripe payment page URL
        expiresAt: new Date(session.expires_at * 1000).toISOString(), // Convert Unix timestamp to ISO
        amount: finalPrice, // For display purposes
        currency: 'usd' // For display purposes
      }
    });

  } catch (err) {
    console.error('Stripe Error:', err);
    apiResponse.error(res, {
      status: false,
      message: err.message || "Error initiating subscription",
      error: err.type === 'StripeInvalidRequestError'
        ? "Invalid payment request"
        : err.stack
    });
  }
};

exports.applyDiscountCode = async (userId, serverId, code) => {
  const discountCode = await DiscountCode.findOne({
    where: {
      code: code,
      [Op.or]: [
        { server_id: serverId },
        { server_id: null }
      ],
      expires_at: { [Op.gt]: new Date() }
    }
  });

  if (!discountCode) {
    return { error: "Invalid or expired discount code" };
  }

  const uses = await DiscountCodeUsage.count({
    where: { discount_code_id: discountCode.id }
  });

  if (uses >= discountCode.max_uses) {
    return { error: "Discount code has reached maximum uses" };
  }

  const userUsed = await DiscountCodeUsage.findOne({
    where: {
      discount_code_id: discountCode.id,
      user_id: userId
    }
  });

  if (userUsed) {
    return { error: "You've already used this discount code" };
  }

  return {
    discount: discountCode.discount_amount,
    codeRecord: discountCode
  };
};

// Webhook for Stripe payment success
exports.handlePaymentSuccess = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    await Subscription.create({
      user_id: session.metadata.user_id,
      server_id: session.metadata.server_id,
      start_date: new Date(),
      expires_at: new Date(new Date().setMonth(new Date().getMonth() + parseInt(session.metadata.months))),
      paid: true,
      via_coupon: session.metadata.via_coupon === 'true'
    });

    if (session.metadata.discount_code) {
      const discountCode = await DiscountCode.findOne({
        where: { code: session.metadata.discount_code }
      });

      if (discountCode) {
        await DiscountCodeUsage.create({
          discount_code_id: discountCode.id,
          user_id: session.metadata.user_id,
          used_at: new Date()
        });
      }
    }
  }

  res.json({ received: true });
};

// Admin endpoints
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'username'] },
        { model: Server, as: 'server' }
      ],
      order: [['expires_at', 'DESC']]
    });

    apiResponse.success(res, {
      message: "All subscriptions fetched successfully",
      data: subscriptions
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error fetching subscriptions",
      error: err.stack
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return apiResponse.error(res, {
        statusCode: 404,
        message: "Subscription not found"
      });
    }

    await subscription.destroy();

    apiResponse.success(res, {
      message: "Subscription cancelled successfully"
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error cancelling subscription",
      error: err.stack
    });
  }
};