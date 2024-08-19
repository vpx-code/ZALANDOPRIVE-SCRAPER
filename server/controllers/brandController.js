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
    console.log(error)
    return null;
  }
};

exports.getBrands = async () => {
  try {
    const brand = await Brand.find();
    if (brand) {
      return brand
    } else {
      return null;
    }
  } catch (error) {
    console.log(error)
    return null;
  }
};