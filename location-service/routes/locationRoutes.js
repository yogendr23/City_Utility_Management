const express = require('express');
const { getLocationData, getHealth, locationLimiter } = require('../controllers/locationController'); // Adjust the path as necessary
const router = express.Router();

// Define the routes with rate limiting and circuit breaker
router.get('/api/location', locationLimiter, getLocationData); // Use the controller with rate limiting
router.get('/api/health', getHealth); // Health check route

module.exports = router;
