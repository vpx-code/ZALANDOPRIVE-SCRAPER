const Brand = require('../models/Brand');

exports.getBrandCode = async (brandName) => {
  try {
    const filter = { 'brandName': brandName };
    const brand = await Brand.findOne(filter);
    if (brand) {
      return brand.brandCode;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};