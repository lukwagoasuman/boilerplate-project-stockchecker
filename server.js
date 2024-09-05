'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Serve static files
app.use('/public', express.static(process.cwd() + '/public'));

// Enable CORS for all origins (used for FCC testing purposes)
app.use(cors({ origin: '*' }));

// Parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helmet middleware for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https:'],
      scriptSrc: ["'self'", 'https:'],
    }
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));

// Enable trust proxy to get correct IP when behind proxies
app.enable('trust proxy');

// Connect to MongoDB
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Home route
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// For FCC testing
fccTestingRoutes(app);

// API routes
app.use(apiRoutes);

// 404 Middleware for undefined routes
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

// Start server and run tests if in test mode
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:', e);
      }
    }, 1500);
  }
});

module.exports = app; // Export the app for testing