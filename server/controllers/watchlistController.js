const Watchlist = require('../models/Watchlist');

exports.createWatchlist = (req, res) => {
  const { name, category, sizes, brands, maxPrice, gender, url } = req.body;
  const watchlistDocument = new Watchlist({
    name,
    category,
    sizes,
    brands,
    maxPrice,
    gender,
    url,
  });

  watchlistDocument.save()
    .then(savedWatchlist => {
      res.status(201).json({
        message: 'Watchlist created successfully',
        watchlist: savedWatchlist
      });
    })
    .catch(error => {
      console.error('Error saving watchlist:', error);
      if (error.name === 'ValidationError') {
        res.status(400).json({
          message: 'Validation error',
          error: error.message
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while creating the watchlist',
          error: error.message
        });
      }
    });
};

exports.getWatchlists = async () => {
  try {
    const watchlists = await Watchlist.find();
    return watchlists;
  } catch (error) {
    throw new Error('Error getting watchlists: ' + error.message);
  }
};

exports.deleteWatchlist = async (watchlistId) => {
  try {
    const deletedWatchlist = await Watchlist.findByIdAndDelete(watchlistId);

    if (!deletedWatchlist) {
      throw new Error('Watchlist not found');
    }

    return deletedWatchlist;
  } catch (error) {
    console.error('Error deleting watchlist:', error.message);
    throw error;
  }
};