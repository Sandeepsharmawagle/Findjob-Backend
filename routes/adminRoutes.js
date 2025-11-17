const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, getJobs, deleteJob, getApplications } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// User management
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Job management
router.get('/jobs', protect, authorize('admin'), getJobs);
router.delete('/jobs/:id', protect, authorize('admin'), deleteJob);

// Application management
router.get('/applications', protect, authorize('admin'), getApplications);

module.exports = router;