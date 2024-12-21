const express = require('express');
const {
  registerUser,
  loginUser,
  getEmployees,
  getUserById,
  updateUser,
  deleteUser,
  getHealth
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for registration and login
const registerLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

router.post('/register', registerLoginRateLimiter, registerUser);
router.post('/login', registerLoginRateLimiter, loginUser);
router.get('/employees', authMiddleware, getEmployees); // Only admin can fetch employees
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id',deleteUser);

// Health check route
router.get('/health', getHealth);

module.exports = router;
