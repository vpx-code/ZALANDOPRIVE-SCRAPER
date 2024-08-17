const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Example route if you need to expose the getCategory function
router.get('/:categorySlug/:gender', async (req, res) => {
  const { categorySlug, gender } = req.params;
  const category = await categoryController.getCategory(categorySlug, gender);
  if (category.response) {
    res.json(category);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

module.exports = router;