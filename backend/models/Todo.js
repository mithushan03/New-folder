const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Homework', 'Office Work'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Not Started', 'Pending', 'Completed'],
    default: 'Not Started',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Todo', TodoSchema);