const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    console.log('Connecting to MongoDB...');
    const products = await Product.find();
    console.log('Products found:', products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: error.message });
  }
};