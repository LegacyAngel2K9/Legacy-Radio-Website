const db = require('../models');
const User = db.users;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // Validate request
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new User
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName || '',
      lastName: req.body.lastName || '',
      role: 'user'
    };

    // Save User in the database
    const data = await User.create(user);
    
    // Create default subscription
    await db.subscriptions.create({
      userId: data.id,
      plan: 'free',
      status: 'active',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: data.id,
        username: data.username,
        email: data.email
      }
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};

exports.login = async (req, res) => {
  try {
    // Find user by username
    const user = await User.findOne({ where: { username: req.body.username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const passwordIsValid = await bcrypt.compare(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    // Update last login
    await User.update({ lastLogin: new Date() }, { where: { id: user.id } });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred during login."
    });
  }
};

exports.refreshToken = (req, res) => {
  // Implement token refresh logic here
  res.status(200).json({ message: "Token refresh endpoint" });
};

exports.logout = (req, res) => {
  // Implement logout logic here
  res.status(200).json({ message: "Logout successful" });
};
