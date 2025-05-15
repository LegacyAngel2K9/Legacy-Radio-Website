const db = require('../models');
const Server = db.Server;
const { Op } = require('sequelize');

exports.getServers = async (req, res) => {
    try {
        const servers = await Server.findAll();

        res.status(200).json({status: true, message: 'Server Fetched Successfully', data: servers});
    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while retrieving servers."
        });
    }
};

exports.createServer = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ status: false, message: "The name field are required." });
        }

        const serverExists = await Server.findOne({
            where: { name: req.body.name }
        });
        
        if (serverExists) {
            return res.status(409).json({ status: false, message: "The server with this name already exists." });
        }

        const server = {
            name: req.body.name,
            user_id: req.userId,
            description: req.body.description || null
        };

        const data = await Server.create(server);

        res.status(201).json({
            status: true,
            message: "Server added successfully.",
            server: data
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while creating a Server."
        });
    }
};

exports.updateServer = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ status: false, message: "The name field are required." });
        }

        const server = await Server.findByPk(req.params.id);

        if (!server) {
            return res.status(404).json({ status: false, message: "Server not found" });
        }

        const serverExists = await Server.findOne({
            where: { 
                name: req.body.name,
                id: { [Op.ne]: req.params.id }
            }
        });

        if (serverExists) {
            return res.status(409).json({ 
                status: false, 
                message: "A server with this name already exists." 
            });
        }

        const [updated] = await Server.update(req.body, {
            where: { id: req.params.id }
        });

        if (updated) {
            const updatedServer = await Server.findByPk(req.params.id);
            return res.status(200).json({ 
                status: true,
                message: "Server updated successfully",
                server: updatedServer 
            });
        } else {
            return res.status(400).json({ 
                status: false,
                message: "Server update failed or no changes were made." 
            });
        }

    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while updating a Server."
        });
    }
};


exports.deleteServer = async (req, res) => {
    try {
      const server = await Server.findByPk(req.params.id);
  
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
  
      await Server.destroy({
        where: { id: req.params.id }
      });
  
      res.status(200).json({ status: true, message: "Server deleted successfully" });
    } catch (err) {
      res.status(500).json({
        message: err.message || "Some error occurred while deleting the Server."
      });
    }
  };