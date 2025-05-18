const db = require('../models');
const Server = db.Server;
const User = db.User;
const { Op } = require('sequelize');
const apiResponse = require('../utils/apiResponse');

exports.getServers = async (req, res) => {
    try {
        const servers = await Server.findAll({
            order: [['created_at', 'DESC']],
            include: [
                { model: User, as: 'user',  attributes: { 
                    exclude: ['password']
                } }
            ]
        }, );

        apiResponse.success(res, {
            message: "Servers Fetched successfully",
            data: servers, 
        });

    } catch (err) {
        apiResponse.error(res, {
            message: err.message || "Some error occurred while retrieving servers.",
            error: err.stack,
        });
    }
};

exports.getServerById = async (req, res) => {
    try {
        const server = await Server.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user',  attributes: { 
                    exclude: ['password']
                } }
            ]
        }, );

        if (!server) {
            apiResponse.error(res, {
                statusCode: 404,
                message: "Server code not found."
            });
        }        

        apiResponse.success(res, {
            message: "Server Fetched successfully",
            data: server, 
        });

    } catch (err) {
        apiResponse.error(res, {
            message: err.message || "Some error occurred while retrieving server.",
            error: err.stack,
        });
    }
}

exports.createServer = async (req, res) => {
    try {
        if (!req.body.name) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { name: "Must be a valid email" },
            });
        }

        const serverExists = await Server.findOne({
            where: { name: req.body.name }
        });

        if (serverExists) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { name: "The server with this name already exists." },
            });
        }

        const server = {
            name: req.body.name,
            user_id: req.userId,
            description: req.body.description || null
        };

        const data = await Server.create(server);

        apiResponse.success(res, {
            statusCode: 201,
            message: "Server added successfully",
            data: data
        });

    } catch (err) {
        apiResponse.error(res, {
            message: err.message || "Some error occurred while retrieving servers.",
            error: err.stack,
        });
    }
};

exports.updateServer = async (req, res) => {
    try {
        if (!req.body.name) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { name: "The name field are required." },
            });
        }

        const server = await Server.findByPk(req.params.id);

        if (!server) {
            apiResponse.error(res, {
                statusCode: 404,
                message: "Server not found"
            });
        }

        const serverExists = await Server.findOne({
            where: {
                name: req.body.name,
                id: { [Op.ne]: req.params.id }
            }
        });

        if (serverExists) {
            return apiResponse.validationError(res, {
                message: "Invalid input.",
                errors: { name: "The server with this name already exists." },
            });
        }

        const [updated] = await Server.update(req.body, {
            where: { id: req.params.id }
        });

        if (updated) {
            const updatedServer = await Server.findByPk(req.params.id);
            apiResponse.success(res, {
                message: "Server updated successfully",
                data: updatedServer
            });
        } else {
            apiResponse.error(res, {
                statusCode: 500,
                message: "Server update failed or no changes were made."
            });
        }

    } catch (err) {
        apiResponse.error(res, {
            message: err.message || "Some error occurred while updating server.",
            error: err.stack,
        });
    }
};


exports.deleteServer = async (req, res) => {
    try {
        const server = await Server.findByPk(req.params.id);

        if (!server) {
            apiResponse.error(res, {
                statusCode: 404,
                message: "Server not found"
            });
        }

        await Server.destroy({
            where: { id: req.params.id }
        });

        apiResponse.success(res, {
            statusCode: 200,
            message: "Server deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while deleting the Server."
        });
    }
};