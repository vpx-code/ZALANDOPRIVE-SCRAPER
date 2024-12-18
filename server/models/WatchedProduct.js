const mongoose = require('mongoose');

const watchedProductSchema = new mongoose.Schema({
    simpleSku: {
        type: String,
        required: true
    },
    configSku: {
        type: String,
        required: true
    },
    campaignIdentifier: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})

const WatchedProduct = mongoose.model('WatchedProduct', watchedProductSchema, 'watched_products');

module.exports = WatchedProduct;