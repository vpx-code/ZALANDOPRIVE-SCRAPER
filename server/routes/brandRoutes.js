const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

router.get('/getAll', async (req, res) => {
  const brands = await brandController.getBrands()
  if (brands) {
    res.json({ brands })
  }
  else {
    res.status(500)
  }
})

// Example route if you need to expose the getBrandCode function
router.get('/code/:brandName', async (req, res) => {
  const brandCode = await brandController.getBrandCode(req.params.brandName);
  if (brandCode) {
    res.json({ brandCode });
  } else {
    res.status(404).json({ error: 'Brand not found' });
  }
});

module.exports = router;