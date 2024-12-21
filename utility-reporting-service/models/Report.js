const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['water', 'electricity', 'waste'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    address: {
      type: String,
      required: true, // Make address required if needed
    },
    city: {
      type: String,
      required: true, // Make city required if needed
    },
    postalCode: {
      type: String,
      required: true, // Make postalCode required if needed
    },
    country: {
      type: String,
      required: true, // Make country required if needed
    },
    coordinates: {
      type: [Number],
      required: true, // Ensure coordinates are required
    },
    type: {
      type: String,
      enum: ['Point'], // Keep this for GeoJSON compatibility
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending',
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Initially unassigned
  },
}, {
  timestamps: true,
});

// Create a 2dsphere index for geo queries
reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
