const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const dockerController = require('../controllers/dockerController');

router.get('/list', productController.getAllProducts);
router.get('/update', dockerController.startAllHellasteeze());
router.put('/watch', productController.watch)
router.delete('/unwatch', productController.unwatch)

module.exports = router;