const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Rejected', 'Accepted'],
    default: 'Applied'
  },
  interviewDate: {
    type: Date
  },
  interviewTime: {
    type: String
  },
  interviewLocation: {
    type: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);