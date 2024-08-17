const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    sizes: {
        type: [String],
        required: true
    },
    brands:  {  
        type: [String],
        required: false
    },
    maxPrice: {
        type: Number,
        required: false
    },
    gender: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: false
    }
})

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;