const mongoose = require('mongoose');

const WeeklyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  week: {
    type: String,
    required: [true, 'Please specify the week identifier (e.g., YYYY-WXX)'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify the start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please specify the end date']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  tasksCompleted: {
    type: [String],
    default: []
  },
  tasksPlanned: {
    type: [String],
    default: []
  },
  blockers: {
    type: [String],
    default: []
  },
  hoursWorked: {
    type: Number,
    required: [true, 'Please specify the number of hours worked'],
    min: [0, 'Hours worked cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Late', 'Approved'],
    default: 'Draft'
  },
  submittedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a member doesn't create duplicate reports for the same week and project
WeeklyReportSchema.index({ user: 1, week: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyReport', WeeklyReportSchema);
