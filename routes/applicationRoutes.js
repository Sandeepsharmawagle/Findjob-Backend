const express = require('express');
const router = express.Router();
const { applyForJob, getUserApplications, getJobApplications, updateApplicationStatus, uploadResume } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Applicant routes
router.post('/', protect, authorize('applicant'), uploadResume, applyForJob);
router.get('/', protect, authorize('applicant'), getUserApplications);

// Employer routes
router.get('/job/:jobId', protect, authorize('employer'), getJobApplications);

// Admin routes
router.put('/:id', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;