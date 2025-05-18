const db = require('../models');
const User = db.User;
const Device = db.Device;
const { Op } = require('sequelize');
const apiResponse = require('../utils/apiResponse');

// User Profile Controllers
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return apiResponse.error(res, {
        statusCode: 404,
        message: "User not found"
      });
    }

    apiResponse.success(res, {
      message: "User profile retrieved successfully",
      data: user
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error retrieving user profile",
      error: err.stack
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    // Validate input
    const allowedFields = ['first_name', 'last_name', 'email'];
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return apiResponse.validationError(res, {
        message: "Invalid fields in request",
        errors: invalidFields.reduce((acc, field) => {
          acc[field] = "Field not allowed for update";
          return acc;
        }, {})
      });
    }

    const [updated] = await User.update(req.body, {
      where: { id: req.userId }
    });

    if (!updated) {
      return apiResponse.error(res, {
        statusCode: 404,
        message: "User not found or no changes made"
      });
    }

    const updatedUser = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    apiResponse.success(res, {
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error updating profile",
      error: err.stack
    });
  }
};

// Admin Controllers
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    apiResponse.success(res, {
      message: "Users retrieved successfully",
      data: users
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error retrieving users",
      error: err.stack
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return apiResponse.error(res, {
        statusCode: 404,
        message: "User not found"
      });
    }

    apiResponse.success(res, {
      message: "User retrieved successfully",
      data: user
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error retrieving user",
      error: err.stack
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Validate input
    const allowedFields = ['first_name', 'last_name', 'email', 'role', 'status'];
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return apiResponse.validationError(res, {
        message: "Invalid fields in request",
        errors: invalidFields.reduce((acc, field) => {
          acc[field] = "Field not allowed for update";
          return acc;
        }, {})
      });
    }

    const [updated] = await User.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return apiResponse.error(res, {
        statusCode: 404,
        message: "User not found or no changes made"
      });
    }

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    apiResponse.success(res, {
      message: "User updated successfully",
      data: updatedUser
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error updating user",
      error: err.stack
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return apiResponse.error(res, {
        statusCode: 404,
        message: "User not found"
      });
    }

    await User.destroy({
      where: { id: req.params.id }
    });

    apiResponse.success(res, {
      message: "User deleted successfully"
    });
  } catch (err) {
    apiResponse.error(res, {
      message: err.message || "Error deleting user",
      error: err.stack
    });
  }
};