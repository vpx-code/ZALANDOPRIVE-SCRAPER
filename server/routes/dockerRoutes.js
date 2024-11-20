const express = require('express');
const router = express.Router();
const dockerController = require('../controllers/dockerController');

router.get('/startAllHellasteeze', (req, res) => {
  dockerController.startAllHellasteeze()
});

module.exports = router;