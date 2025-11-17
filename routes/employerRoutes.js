const express = require('express');
const router = express.Router();
const { 
  getEmployerJobs, 
  getEmployerApplications, 
  updateApplicationStatus,
  updateJob,
  updateJobStatus,
  deleteJob
} = require('../controllers/employerController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/jobs', protect, authorize('employer'), getEmployerJobs);
router.put('/jobs/:id', protect, authorize('employer'), updateJob);
router.put('/jobs/:id/status', protect, authorize('employer'), updateJobStatus);
router.delete('/jobs/:id', protect, authorize('employer'), deleteJob);
router.get('/applications', protect, authorize('employer'), getEmployerApplications);
router.put('/applications/:id', protect, authorize('employer'), updateApplicationStatus);

module.exports = router;