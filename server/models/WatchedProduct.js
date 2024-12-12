const mongoose = require('mongoose');

const watchedProductSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    }
})

const WatchedProduct = mongoose.model('WatchedProduct', watchedProductSchema, 'watched_products');

module.exports = WatchedProduct;