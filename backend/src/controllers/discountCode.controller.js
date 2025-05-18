const db = require('../models');
const { Op } = require('sequelize');
const DiscountCode = db.DiscountCode;
const Server = db.Server;
const DiscountCodeUsage = db.DiscountCodeUsage;
const User = db.User;
const apiResponse = require('../utils/apiResponse');

exports.generateDiscountCode = async (req, res) => {
    try {
        const { server_id, expires_at, max_uses } = req.body;
        const created_by = req.userId;

        // Basic validations
        if (!server_id) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { server_id: "The server id field is required." },
            });
        }

        if (!expires_at) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { expires_at: "The expiry date field is required." },
            });
        }

        if (!max_uses && max_uses !== 0) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { max_uses: "The max uses field is required." },
            });
        }

        if (isNaN(max_uses) || parseInt(max_uses) <= 0) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { max_uses: "The max uses field must be a positive number." },
            });
        }

        const expiryDate = new Date(expires_at);
        if (expiryDate <= new Date()) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { max_uses: "The expiry date must be in the future." },
            });
        }

        // Check if server exists
        const server = await Server.findByPk(server_id);
        if (!server) {
            return apiResponse.error(res, {
                statusCode: 404,
                message: "Server not found",
            });
        }

        const code = generateRandomCode(8);

        const discountCode = await DiscountCode.create({
            code,
            server_id,
            expires_at: expiryDate,
            max_uses: parseInt(max_uses),
            created_by,
        });

        apiResponse.success(res, {
            statusCode: 201,
            message: "Discount code generated successfully.",
            data: discountCode
        });

    } catch (err) {
        apiResponse.error(res, {
            message: err.message || "Failed to generate discount code.",
            error: err.stack,
        });
    }
};

exports.getAllDiscountCodes = async (req, res) => {
    try {
        const discountCodes = await DiscountCode.findAll({
            order: [['created_at', 'DESC']],
            include: [
                { model: Server, as: 'server' },
                {
                    model: User, as: 'creator', attributes: {
                        exclude: ['password']
                    }
                },
                { model: DiscountCodeUsage, as: 'discount_code_usages' },
            ],
        });

        apiResponse.success(res, {
            message: "Discount codes fetched successfully.",
            data: discountCodes
        });

    } catch (err) {
        apiResponse.error(res, {
            message: err.message || "Failed to fetch discount codes.",
            error: err.stack,
        });
    }
};

exports.getDiscountCodeById = async (req, res) => {
    try {
        const discountCode = await DiscountCode.findByPk(req.params.id, {
            include: [
                { model: Server, as: 'server' },
                {
                    model: User, as: 'creator', attributes: {
                        exclude: ['password']
                    }
                },
                { model: DiscountCodeUsage, as: 'discount_code_usages' },
            ],
        });

        if (!discountCode) {
            apiResponse.error(res, {
                statusCode: 404,
                message: "Discount code not found."
            });
        }

        apiResponse.success(res, {
            message: "Discount code fetched successfully.",
            data: discountCode
        });

    } catch (err) {
        apiResponse.error(res, {
            message: err.message || "Failed to fetch discount code.",
            error: err.stack,
        });
    }
};

exports.deleteDiscountCode = async (req, res) => {
    try {
        const deleted = await DiscountCode.destroy({
            where: { id: req.params.id },
        });

        if (!deleted) {
            apiResponse.error(res, {
                statusCode: 404,
                message: "Discount code not found."
            });
        }

        apiResponse.success(res, {
            message: "Discount code deleted successfully."
        });

    } catch (err) {
        apiResponse.error(res, {
            message: err.message || "Failed to delete discount code.",
            error: err.stack,
        });
    }
};

function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}