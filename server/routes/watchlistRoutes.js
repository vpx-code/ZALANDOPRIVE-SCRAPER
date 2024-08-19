const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

router.post('/createWatchlist', watchlistController.createWatchlist);

router.get('/getAll', async (req, res) => {
  try {
    const watchlists = await watchlistController.getWatchlists();
    res.status(200).json(watchlists);
  } catch (error) {
    res.status(500).json({ message: 'Error getting watchlists', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const watchlistId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(watchlistId)) {
      return res.status(400).json({ message: 'Invalid watchlist ID' });
    }

    const deletedWatchlist = await watchlistController.deleteWatchlist(watchlistId);

    if (!deletedWatchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    res.status(200).json({
      message: 'Watchlist deleted successfully',
      watchlist: deletedWatchlist
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting watchlist',
      error: error.message
    });
  }
});

module.exports = router;