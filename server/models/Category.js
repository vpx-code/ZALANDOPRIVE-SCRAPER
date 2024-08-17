const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    filterName: String,
    categoryId: Number,
    categorySlug: String,
    gender: String
})

const Category = mongoose.model('CategoryModel', CategorySchema, 'tagged_categories');
module.exports = Category;