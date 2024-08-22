const express = require('express');
const router = express.Router();
const dockerController = require('../controllers/dockerController');

router.get('/startAllServices', (req, res) => {
  dockerController.startAllServices()
});

module.exports = router;