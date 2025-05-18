const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const apiResponse = require('../utils/apiResponse');

exports.register = async (req, res) => {
  try {
    // Validate request
    const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return apiResponse.validationError(res, {
        message: "Missing required fields",
        errors: missingFields.reduce((acc, field) => {
          acc[field] = `${field.replace('_', ' ')} is required`;
          return acc;
        }, {})
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (existingUser) {
      const errors = {};
      if (existingUser.username === req.body.username) {
        errors.username = "Username already taken";
      }
      if (existingUser.email === req.body.email) {
        errors.email = "Email already registered";
      }
      return apiResponse.validationError(res, {
        message: "User already exists",
        errors
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create user
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      role: 'user'
    };

    const data = await User.create(user);

    // Generate JWT token immediately after registration
    const token = jwt.sign(
      { id: data.id, role: data.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    apiResponse.success(res, {
      statusCode: 201,
      message: "User registered successfully",
      data: {
        user: {
          id: data.id,
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role
        },
        token
      }
    });

  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error during registration",
      error: err.stack
    });
  }
};

exports.login = async (req, res) => {
  try {
   
    // Validate input
    if (!req.body.username || !req.body.password) {
      return apiResponse.validationError(res, {
        message: "Invalid credentials",
        errors: {
          username: !req.body.username ? "Username is required" : undefined,
          password: !req.body.password ? "Password is required" : undefined
        }
      });
    }

    // Find user
    const user = await User.findOne({ where: { username: req.body.username } });

    if (!user) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: "Invalid credentials"
      });
    }

    // Check password
    const passwordIsValid = await bcrypt.compare(req.body.password, user.password);

    if (!passwordIsValid) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: "Invalid credentials"
      });
    }

    // Update last login
    await User.update({ last_login: new Date() }, { where: { id: user.id } });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    apiResponse.success(res, {
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        token
      }
    });

  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error during login",
      error: err.stack
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: "Refresh token required"
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return apiResponse.error(res, {
          statusCode: 403,
          message: "Invalid refresh token"
        });
      }

      const newToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      apiResponse.success(res, {
        message: "Token refreshed",
        data: { token: newToken }
      });
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error refreshing token",
      error: err.stack
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // In a real implementation, you might blacklist the token here
    apiResponse.success(res, {
      message: "Logout successful"
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error during logout",
      error: err.stack
    });
  }
};