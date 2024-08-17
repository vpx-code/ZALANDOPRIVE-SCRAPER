const Category = require('../models/Category');

exports.getCategory = async (categorySlug, gender) => {
  try {
    const response = await Category.findOne({ categorySlug, gender });
    return { response };
  } catch (error) {
    return { response: null };
  }
};