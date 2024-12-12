const Product = require('../models/Product');
const WatchedProduct = require('../models/WatchedProduct')

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

exports.watch = async (req, res) => {
  try {
    const { sku, size } = req.body;
    if (!sku || !size) {
      return res.status(400).json({ error: 'sku and size are required' });
    }
    console.log(`Watching product SKU: ${sku}, Size: ${size}`);
    await WatchedProduct.create({ sku, size });
    res.status(201).json({ message: 'Product watched', sku, size });
  } catch (error) {
    console.error('Error watching product:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.unwatch = async (req, res) => {
  try {
    const { sku, size } = req.body;
    if (!sku || !size) {
      return res.status(400).json({ error: 'sku and size are required' });
    }
    console.log(`Unwatching product SKU: ${sku}, Size: ${size}`);
    const result = await WatchedProduct.deleteMany({ sku, size });
    console.log("Am I frozen?")
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No matching products found to unwatch' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error unwatching product:', error.message);
    res.status(500).json({ error: error.message });
  }
};