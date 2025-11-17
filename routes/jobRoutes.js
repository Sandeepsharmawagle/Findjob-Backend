const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, updateJob, deleteJob, getJobsWithApplicationStatus } = require('../controllers/jobController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public routes with optional authentication to show application status
router.get('/browse', optionalProtect, getJobsWithApplicationStatus);
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes
router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;