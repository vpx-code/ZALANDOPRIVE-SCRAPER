const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    nameCategoryTag: { type: String },
    nameColor: { type: String },
    brand: { type: String },
    nameShop: { type: String },
    specialPrice: [{ type: Number }],
    images: [{ type: String }],
    brandCode: { type: String },
    sku: { type: String },
    campaignEndDate: [{ type: Date }],
    stockStatus: { type: String },
    urlPath: { type: String }
});

const Product = mongoose.model('ProductModel', ProductSchema, 'products');
module.exports = Product;