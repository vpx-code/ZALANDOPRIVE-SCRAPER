const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const readSecret = (name) => fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
const productRoutes = require('./routes/productRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const accountRoutes = require('./routes/accountRoutes');
const brandRoutes = require('./routes/brandRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
require('./scheduler');

const app = express();
const PORT = process.env.PORT || 1939;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGODB_URI = readSecret('mongodb_uri');
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const apiPrefix = "/api"
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/watchlists`, watchlistRoutes);
app.use(`${apiPrefix}/brands`, brandRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/account`, accountRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});