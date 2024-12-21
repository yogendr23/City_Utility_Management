const express = require('express');
const { 
  createReport, 
  getReports, 
  updateReportStatus, 
  assignReportToEmployee, 
  getReportsByEmployee,
  getAllReports,
  deleteReport,
  getHealth 
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin'); // Admin middleware
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for creating reports
const createReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Define the routes with authentication middleware
router.post('/', authMiddleware, createReportLimiter, createReport); // Create a new report
router.get('/', authMiddleware, getReports); // Get all reports for a user
router.get('/all', authMiddleware, isAdmin, getAllReports); // Admin can get all reports
router.put('/status', authMiddleware, updateReportStatus); // Update report status
router.put('/assign', authMiddleware, assignReportToEmployee); // Assign report to employee
router.get('/assigned', authMiddleware, getReportsByEmployee); // Get reports assigned to employee
router.delete('/:reportId', authMiddleware, deleteReport);

// Health check route
router.get('/health', getHealth);

module.exports = router;
