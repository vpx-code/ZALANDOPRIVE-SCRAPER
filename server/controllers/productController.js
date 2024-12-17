const Product = require('../models/Product');
const WatchedProduct = require('../models/WatchedProduct')
const runProfessorCarter = require('./dockerController').runProfessorCarter

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
    const product = { simpleSku: req.body.simpleSku, configSku: req.body.configSku, campaignIdentifier: req.body.campaignIdentifier, quantity: 1 };

    if (!product.simpleSku || !product.configSku  || !product.campaignIdentifier ) {
      return res.status(400).json({ error: 'Required fields missing!' });
    }
    console.log(`Watching product SKU: ${JSON.stringify(product)}`);

    const isSaved = await saveWatchedProductToDb(product);
    if (isSaved) {
      res.status(201).json({ message: 'Product watched', product });
    } else {
      res.status(500).json({ error: 'Failed to watch product.' });
    }

    watchProduct(product)

  } catch (error) {
    console.error('Error watching product:', error.message);
    res.status(500).json({ error: error.message });
  }
};

async function saveWatchedProductToDb(product) {
  try {
    await WatchedProduct.create({ simpleSku: product.simpleSku, configSku: product.configSku, campaignIdentifier: product.campaignIdentifier, quantity: product.quantity });
    return true;
  } catch (error) {
    console.error("Error saving product to DB:", error);
    return false;
  }
}

async function deleteWatchedProductFromDb(simpleSku) {
  try {
    const result = await WatchedProduct.deleteMany({ simpleSku });
    return result.deletedCount !== 0;
  } catch (error) {
    console.error('Error deleting product from DB:', error.message);
    throw error;
  }
}

let cartTaskObject = null;

async function watchProduct(product) {
  console.log(`Running cart loop. Ongoing tasks: ${cartTaskObject}`)
  if (cartTaskObject) {
    clearTimeout(cartTaskObject)
  }

  await runProfessorCarter(product)
  cartTaskObject = setTimeout(() => {
    watchProduct(product)
  }, 20 * 60 * 1000)
}

exports.unwatch = async (req, res) => {
  try {
    const simpleSku = req.body.simpleSku;

    if (!simpleSku) {
      return res.status(400).json({ error: 'Required field "Simple SKU" is missing.' });
    }
    console.log(`Unwatching product SKU: ${simpleSku}.`);

    clearTimeout(cartTaskObject);
    console.log(`Cleared timeout. Ongoing tasks: ${cartTaskObject}. Setting it to null just in case...`);
    cartTaskObject = null;

    const isProductUnwatchedFromDb = await deleteWatchedProductFromDb(simpleSku);
    if (isProductUnwatchedFromDb) {
      res.status(204).send();
    }
    else {
      res.status(404).json({ error: 'No matching products found to unwatch' });
    }
  } catch (error) {
    console.error('Error unwatching product:', error.message);
    res.status(500).json({ error: error.message });
  }
};