const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getHealth, // Health check handler
} = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rate Limiter Configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Define routes
router.post('/', authMiddleware, createAnnouncement); // Create a new announcement
router.get('/', getAllAnnouncements); // Get all announcements (publicly accessible)
router.put('/:announcementId', authMiddleware, updateAnnouncement); // Update an announcement
router.delete('/:announcementId', authMiddleware, deleteAnnouncement); // Delete an announcement

// Health Check Route
router.get('/health', getHealth); // Add a health check endpoint

module.exports = router;
