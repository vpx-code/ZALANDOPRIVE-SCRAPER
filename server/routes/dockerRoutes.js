const express = require('express');
const router = express.Router();
const dockerController = require('../controllers/dockerController');

router.get('/create-service', (req, res) => {
  const payload = 'https://www.zalando-prive.es/api/phoenix/search/ccf/articles?category_ids=142293876&brand_codes=PO2%2CBB1&sizes.tops=XL&size=60&sort=availability_female&no_soldout=1';
  dockerController.createService(res, watchlist.name.replace(/\s/g, ''), payload);
});


module.exports = router;