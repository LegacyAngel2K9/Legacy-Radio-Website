const express = require('express');
const router = express.Router();
const serverController = require('../controllers/server.controller');
const { authJwt } = require('../middleware');

router.get('/', [authJwt.verifyToken, authJwt.isAdmin], serverController.getServers);
router.post('/create', [authJwt.verifyToken, authJwt.isAdmin], serverController.createServer);

module.exports = router;
