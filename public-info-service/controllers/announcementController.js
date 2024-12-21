const { Worker } = require('worker_threads');
const retry = require('async-retry');
const CircuitBreaker = require('opossum');
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');

// Define a circuit breaker for database operations
const dbCircuitBreaker = new CircuitBreaker(
  async (operation) => {
    return await retry(
      async (bail) => {
        try {
          return await operation();
        } catch (error) {
          // Bail on non-recoverable errors
          if (error.name === 'ValidationError') bail(error); // Example: bail on validation errors
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

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  const { title, content, type, startDate, endDate } = req.body;

  const session = await mongoose.startSession(); // Start a transaction
  session.startTransaction(); // Begin a transaction

  try {
    const createOperation = () =>
      new Announcement({ title, content, type, startDate, endDate }).save({ session }); // Save with transaction

    const announcement = await dbCircuitBreaker.fire(createOperation);

    await session.commitTransaction(); // Commit the transaction

    res.status(201).json(announcement);
  } catch (error) {
    await session.abortTransaction(); // Rollback the transaction if any error

    if (dbCircuitBreaker.opened) {
      console.error('Circuit breaker is open:', error);
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
    }
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession(); // End the session
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const fetchAnnouncements = () => Announcement.find();

    const announcements = await dbCircuitBreaker.fire(fetchAnnouncements);
    res.json(announcements);
  } catch (error) {
    if (dbCircuitBreaker.opened) {
      console.error('Circuit breaker is open:', error);
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
    }
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit an announcement
exports.updateAnnouncement = async (req, res) => {
  const { announcementId } = req.params;
  const { title, content, type, startDate, endDate } = req.body;

  const session = await mongoose.startSession(); // Start a transaction
  session.startTransaction(); // Begin a transaction

  try {
    const updateOperation = () =>
      Announcement.findByIdAndUpdate(
        announcementId,
        { title, content, type, startDate, endDate, updatedAt: Date.now() },
        { new: true, session } // Update with transaction
      );

    const announcement = await dbCircuitBreaker.fire(updateOperation);

    if (!announcement) {
      await session.abortTransaction(); // Rollback if not found
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await session.commitTransaction(); // Commit the transaction
    res.json(announcement);
  } catch (error) {
    await session.abortTransaction(); // Rollback the transaction if any error
    if (dbCircuitBreaker.opened) {
      console.error('Circuit breaker is open:', error);
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
    }
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession(); // End the session
  }
};

// Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  const { announcementId } = req.params;

  const session = await mongoose.startSession(); // Start a transaction
  session.startTransaction(); // Begin a transaction

  try {
    const deleteOperation = () => Announcement.findByIdAndDelete(announcementId, { session }); // Delete with transaction

    const announcement = await dbCircuitBreaker.fire(deleteOperation);

    if (!announcement) {
      await session.abortTransaction(); // Rollback if not found
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await session.commitTransaction(); // Commit the transaction
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    await session.abortTransaction(); // Rollback the transaction if any error
    if (dbCircuitBreaker.opened) {
      console.error('Circuit breaker is open:', error);
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
    }
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession(); // End the session
  }
};

// Health monitoring endpoint
exports.getHealth = (req, res) => {
  res.json({
    circuitBreaker: {
      open: dbCircuitBreaker.opened,
      closed: !dbCircuitBreaker.opened,
      stats: dbCircuitBreaker.stats,
    },
  });
};
