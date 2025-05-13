const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // Validate request
    if (!req.body.first_name || !req.body.last_name || !req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new User
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      first_name: req.body.first_name || '',
      last_name: req.body.last_name || '',
      role: 'user'
    };

    // Save User in the database
    const data = await User.create(user);

    res.status(201).json({
      message: "User registered successfully!",
      user: data
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
      return res.status(404).json({ status: false, message: "These credentials do not match our records." });
    }

    // Check password
    const passwordIsValid = await bcrypt.compare(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ status: false, message: "These credentials do not match our records." });
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
      token: token,
      status: true
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred during login."
    });
  }
};

exports.refreshToken = (req, res) => {
  res.status(200).json({ message: "Token refresh endpoint" });
};

exports.logout = (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};
