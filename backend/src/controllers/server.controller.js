const db = require('../models');
const Server = db.Server;
const jwt = require('jsonwebtoken');

exports.getServers = async (req, res) => {
    try {
        const servers = await Server.findAll();

        res.status(200).json(servers);
    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while retrieving servers."
        });
    }
}

exports.createServer = async (req, res) => {
    try {

        if (!req.body.name) {
            return res.status(400).json({ message: "The name field are required." });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const server = {
            name: req.body.name,
            user_id: req.user.id,
            description: req.body.description || null
        };

        const data = await Server.create(server);

        res.status(201).json({
            message: "Server added successfully.",
            server: data
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while creating a Server."
        });
    }
}