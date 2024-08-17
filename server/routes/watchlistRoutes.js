const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

router.get('/start-all-services', async (req, res) => {
  try {
    await watchlistController.startAllServices();
    res.status(200).send('All services started successfully');
  } catch (error) {
    res.status(500).send('Error starting services');
  }
});

module.exports = router;