const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/list', productController.getAllProducts);
router.put('/watch', productController.watch)
router.delete('/unwatch', productController.unwatch)

module.exports = router;