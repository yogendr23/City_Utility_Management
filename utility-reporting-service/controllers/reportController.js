const Report = require('../models/Report');
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
          if (error.name === 'ValidationError') bail(error);
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

// Rate limiting for creating reports
const createReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Create a new utility issue report
exports.createReport = async (req, res) => {
  const { type, description, location } = req.body;

  // Ensure the location is structured correctly
  const locationData = {
    address: location.address,
    city: location.city,
    postalCode: location.postalCode,
    country: location.country,
    coordinates: location.coordinates || [0, 0], // Fallback if coordinates are not provided
    type: 'Point', // GeoJSON type
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Operation to create report
    const createOperation = () => 
      Report.create(
        [
          {
            userId: req.user.id, // Persist userId of the report creator
            type,
            description,
            location: locationData, // Pass the structured location data
          }
        ],
        { session }
      );

    const report = await dbCircuitBreaker.fire(createOperation);

    await session.commitTransaction(); // Commit transaction if report is created successfully
    res.status(201).json(report);
  } catch (error) {
    await session.abortTransaction(); // Rollback transaction if error occurs
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// Get all reports for a user
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reports for admin
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({});
    res.json(reports);
  } catch (error) {
    console.error('Error fetching all reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  const { reportId, status } = req.body;
  try {
    const updateOperation = () => 
      Report.findByIdAndUpdate(reportId, { status }, { new: true });

    const updatedReport = await dbCircuitBreaker.fire(updateOperation);

    if (!updatedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign a report to an employee
exports.assignReportToEmployee = async (req, res) => {
  const { reportId, employeeId } = req.body;

  try {
    const assignOperation = () => 
      Report.findByIdAndUpdate(
        reportId,
        { assignedEmployee: employeeId },
        { new: true }
      );

    const report = await dbCircuitBreaker.fire(assignOperation);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error assigning report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reports assigned to a specific employee
exports.getReportsByEmployee = async (req, res) => {
  const employeeId = req.user.id; // Get the authenticated user's ID
  try {
    const reports = await Report.find({ assignedEmployee: employeeId });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports for employee:', error);
    res.status(500).json({ message: 'Error fetching reports for employee' });
  }
};

// Delete a report by ID
exports.deleteReport = async (req, res) => {
  const { reportId } = req.params; // Get reportId from the URL parameters
  try {
    const deleteOperation = () => 
      Report.findByIdAndDelete(reportId);

    const deletedReport = await dbCircuitBreaker.fire(deleteOperation);

    if (!deletedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
