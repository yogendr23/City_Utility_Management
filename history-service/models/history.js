const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
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
  coordinates: {
     type: [Number],
     required: true,
  },
  status: {
     type: String,
     enum: ['completed'],
  },
  assignedEmployee: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     default: null,
  },
  createdAt: {
     type: Date,
     default: Date.now,
  },
  updatedAt: {
     type: Date,
     default: Date.now,
  }
});


// Manually handle timestamps in your code
const history = mongoose.model('history', historySchema);
module.exports = history;
