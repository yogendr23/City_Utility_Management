const express = require('express');
const {
  createHistory, // CamelCase method name
  getAllHistory,
  getHistoryByUserId, // CamelCase method name
  getHealth // Health check route
} = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin'); // Admin authorization middleware
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting middleware for creating history
const createHistoryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Define the routes with authentication middleware
router.post('/', authMiddleware, createHistoryRateLimiter, createHistory); // Create a new history
router.get('/all', authMiddleware, isAdmin, getAllHistory); // Admin endpoint to get all histories
router.get('/user/:userId', authMiddleware, getHistoryByUserId); // Get history by userId

// Health check route
router.get('/health', getHealth); // Health check for circuit breaker

module.exports = router;
