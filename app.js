require('dotenv/config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

// Middleware & Helpers
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes/index');
const authJwt = require('./helpers/jwt');
const errorhandler = require('./helpers/error-handler');

// Environment Variables
const corsOrigin = process.env.CORS_ORIGIN || '*'; // fallback to allow all origins
const api = process.env.API_URL || '/api/v1';
const PORT = process.env.PORT || 3000;

// Built-in Middleware
app.use(cors({ origin: corsOrigin }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
// app.use(authJwt()); // Uncomment when ready
app.use(errorhandler);

// Database Connection
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log('✅ Database connection successful!'))
  .catch((err) => console.error('❌ Database connection failed:', err));

// Health Check Route (Important for Heroku)
app.get('/', (req, res) => {
  res.send('🎉 ecoTrack backend is live and connected!');
});

// Main API Routes
app.use(api, routes);

// Global Error Handler (last middleware)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
