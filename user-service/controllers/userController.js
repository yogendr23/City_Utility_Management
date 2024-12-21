const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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

// Rate limiting for registration and login routes
const registerLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createOperation = () => User.create([{ name, email, password: hashedPassword, role }], { session });

    const user = await dbCircuitBreaker.fire(createOperation);

    await session.commitTransaction(); // Commit transaction if user is created successfully

    res.status(201).json({
      user: {
        _id: user[0]._id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
      }
    });
  } catch (error) {
    await session.abortTransaction(); // Rollback transaction if error occurs
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};

// User login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create and sign a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' });
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user details
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, password } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10); // Hash password if updating

    const updateOperation = () =>
      User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true, session });

    const updatedUser = await dbCircuitBreaker.fire(updateOperation);

    await session.commitTransaction();

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deleteOperation = () => User.findByIdAndDelete(userId, { session });

    const deletedUser = await dbCircuitBreaker.fire(deleteOperation);

    await session.commitTransaction();

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
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
