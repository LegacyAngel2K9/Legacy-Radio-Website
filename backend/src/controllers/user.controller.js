const db = require('../models');
const User = db.User;

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving user profile."
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    await User.update(req.body, {
      where: { id: req.userId }
    });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while updating the profile."
    });
  }
};

exports.getUserDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({
      where: { userId: req.userId }
    });

    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving devices."
    });
  }
};

exports.addUserDevice = async (req, res) => {
  try {
    // Validate request
    if (!req.body.deviceId || !req.body.deviceType) {
      return res.status(400).json({ message: "DeviceId and deviceType are required!" });
    }

    // Create a device
    const device = {
      userId: req.userId,
      deviceId: req.body.deviceId,
      deviceName: req.body.deviceName || 'Unnamed Device',
      deviceType: req.body.deviceType,
      lastActive: new Date(),
      status: 'active',
      metadata: req.body.metadata || {}
    };

    // Save device in database
    const data = await Device.create(device);

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while adding the device."
    });
  }
};

// Admin controllers
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving users."
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving the user."
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    await User.update(req.body, {
      where: { id: req.params.id }
    });

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while updating the user."
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.destroy({
      where: { id: req.params.id }
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deleting the user."
    });
  }
};
