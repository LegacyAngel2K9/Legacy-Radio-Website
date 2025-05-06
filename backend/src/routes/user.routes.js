const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authJwt } = require('../middleware');

// User routes
router.get('/profile', [authJwt.verifyToken], userController.getUserProfile);
router.put('/profile', [authJwt.verifyToken], userController.updateUserProfile);
router.get('/devices', [authJwt.verifyToken], userController.getUserDevices);
router.post('/devices', [authJwt.verifyToken], userController.addUserDevice);

// Admin routes
router.get('/', [authJwt.verifyToken, authJwt.isAdmin], userController.getAllUsers);
router.get('/:id', [authJwt.verifyToken, authJwt.isAdmin], userController.getUserById);
router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], userController.updateUser);
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], userController.deleteUser);

module.exports = router;
