const express = require('express');
const router = express.Router();
const discountCodeController = require('../controllers/discountCode.controller');
const { authJwt } = require('../middleware');


router.get('/', [authJwt.verifyToken, authJwt.isAdmin], discountCodeController.getAllDiscountCodes);
router.get('/:id', [authJwt.verifyToken, authJwt.isAdmin], discountCodeController.getDiscountCodeById);
router.post('/generate', [authJwt.verifyToken, authJwt.isAdmin], discountCodeController.generateDiscountCode);
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], discountCodeController.deleteDiscountCode);

module.exports = router;