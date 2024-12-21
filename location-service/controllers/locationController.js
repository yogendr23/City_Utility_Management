const axios = require('axios');
const retry = require('async-retry');
const CircuitBreaker = require('opossum');
const rateLimit = require('express-rate-limit');

// Define a circuit breaker for OpenCage API calls
const locationCircuitBreaker = new CircuitBreaker(
  async (operation) => {
    return await retry(
      async (bail) => {
        try {
          return await operation();
        } catch (error) {
          // Bail on non-recoverable errors
          if (error.name === 'ValidationError') bail(error);
          throw error; // Retry for transient errors
        }
      },
      { retries: 3, factor: 2 } // Retry 3 times with exponential backoff
    );
  },
  {
    timeout: 10000, // Timeout after 10 seconds
    errorThresholdPercentage: 50, // Open the circuit if 50% of requests fail
    resetTimeout: 20000, // Try to reset the circuit after 20 seconds
  }
);

// Log circuit breaker events
locationCircuitBreaker.on('open', () => console.warn('Location service circuit breaker opened'));
locationCircuitBreaker.on('halfOpen', () => console.info('Location service circuit breaker half-open'));
locationCircuitBreaker.on('close', () => console.info('Location service circuit breaker closed'));

// Rate limiting for location fetching
const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

// Controller function to handle the location fetching logic
const getLocationData = async (req, res) => {
  const { latitude, longitude } = req.query;

  // Ensure latitude and longitude are passed as strings
  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    // Construct the URL for the OpenCage API
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${process.env.OPENCAGE_API_KEY}`;

    // Define the operation to fetch location data
    const fetchLocation = async () => {
      const response = await axios.get(url);
      return response.data;
    };

    // Use the circuit breaker to fetch location
    const result = await locationCircuitBreaker.fire(fetchLocation);

    // Check if results are returned
    if (result.results && result.results.length > 0) {
      const location = result.results[0];

      // Extracting components
      const streetAddress = location.components.road || '';
      const houseNumber = location.components.house_number ? `${location.components.house_number}, ` : '';
      const neighbourhood = location.components.neighbourhood ? `${location.components.neighbourhood}, ` : '';
      const city = location.components.state_district || location.components.town || '';
      const state = location.components.state || '';
      const postalCode = location.components.postcode || '';
      const country = location.components.country || '';

      // Building the address format
      const formattedAddress = `${houseNumber}${streetAddress}${neighbourhood}`.replace(/,\s*$/, ''); // Trim any trailing comma
      const formattedCity = `${city}${state ? `, ${state}` : ''}`.trim();

      res.json({
        address: formattedAddress,
        city: formattedCity,
        postalCode: postalCode,
        country: country,
        coordinates: [longitude, latitude],
      });
    } else {
      res.status(404).json({ message: 'Location not found for the provided coordinates' });
    }
  } catch (error) {
    console.error('Error fetching location data from OpenCage:', error);
    res.status(500).json({ message: 'Failed to fetch location data.' });
  }
};

// Health check route for monitoring
const getHealth = (req, res) => {
  res.json({
    circuitBreaker: {
      open: locationCircuitBreaker.opened,
      closed: !locationCircuitBreaker.opened,
      stats: locationCircuitBreaker.stats,
    },
  });
};

module.exports = { getLocationData, getHealth, locationLimiter };
