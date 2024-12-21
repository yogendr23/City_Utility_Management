const History = require('../models/history');
const mongoose = require('mongoose');
const retry = require('async-retry');
const CircuitBreaker = require('opossum');
const rateLimit = require('express-rate-limit');

// Define a circuit breaker for database operations
const dbCircuitBreaker = new CircuitBreaker(
  async (operation) => {
    return await retry(
      async (bail) => {
        try {
          return await operation();
        } catch (error) {
          // Bail on non-recoverable errors
          if (error.name === 'ValidationError') bail(error); // Bail on validation errors
          throw error; // Retry for transient errors
        }
      },
      { retries: 3, factor: 2 } // 3 retries with exponential backoff
    );
  },
  {
    timeout: 15000, // Timeout after 15 seconds
    errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
    resetTimeout: 30000, // Try to close circuit after 30 seconds
  }
);

// Log circuit breaker events
dbCircuitBreaker.on('open', () => console.warn('Circuit breaker opened'));
dbCircuitBreaker.on('halfOpen', () => console.info('Circuit breaker half-open'));
dbCircuitBreaker.on('close', () => console.info('Circuit breaker closed'));

// Rate limiting middleware
const createHistoryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Create a new history
exports.createHistory = async (req, res) => {
  const { userId, type, description, coordinates, createdAt, updatedAt, assignedEmployee, status } = req.body;

  // Validate coordinates
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return res.status(400).json({ message: 'Invalid coordinates format. It should be an array with two numbers.' });
  }

  const session = await mongoose.startSession(); // Start a transaction
  session.startTransaction(); // Begin the transaction

  try {
    const createOperation = () =>
      new History({
        userId,
        type,
        description,
        coordinates,
        assignedEmployee: assignedEmployee || null,
        status: status || 'resolved',
        createdAt: createdAt || new Date(),
        updatedAt: updatedAt || new Date(),
      }).save({ session }); // Save with transaction

    const newHistory = await dbCircuitBreaker.fire(createOperation);

    await session.commitTransaction(); // Commit the transaction

    res.status(201).json(newHistory);
  } catch (error) {
    await session.abortTransaction(); // Rollback transaction in case of an error
    console.error('Error creating history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession(); // End the session
  }
};

// Get all histories for admin
exports.getAllHistory = async (req, res) => {
  try {
    const fetchHistories = () => History.find({});
    const histories = await dbCircuitBreaker.fire(fetchHistories);
    res.json(histories);
  } catch (error) {
    console.error('Error fetching all histories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all histories for a specific user
exports.getHistoryByUserId = async (req, res) => {
  const { userId } = req.params; // Get userId from the route parameters

  try {
    const fetchHistories = () => History.find({ userId }); // Find histories by userId
    const histories = await dbCircuitBreaker.fire(fetchHistories);

    if (!histories.length) {
      return res.status(404).json({ message: 'No history found for this user.' });
    }
    res.json(histories);
  } catch (error) {
    console.error('Error fetching histories by user ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Health check route for monitoring circuit breaker status
exports.getHealth = (req, res) => {
  res.json({
    circuitBreaker: {
      open: dbCircuitBreaker.opened,
      closed: !dbCircuitBreaker.opened,
      stats: dbCircuitBreaker.stats,
    },
  });
};
