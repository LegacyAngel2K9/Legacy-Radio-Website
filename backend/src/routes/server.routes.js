const express = require('express');
const router = express.Router();
const serverController = require('../controllers/server.controller');
const { authJwt } = require('../middleware');

router.get('/', [authJwt.verifyToken, authJwt.isAdmin], serverController.getServers);
router.get('/:id', [authJwt.verifyToken, authJwt.isAdmin], serverController.getServerById);
router.post('/create', [authJwt.verifyToken, authJwt.isAdmin], serverController.createServer);
router.put('/:id/update', [authJwt.verifyToken, authJwt.isAdmin], serverController.updateServer);
router.delete('/:id/delete', [authJwt.verifyToken, authJwt.isAdmin], serverController.deleteServer);

module.exports = router;
