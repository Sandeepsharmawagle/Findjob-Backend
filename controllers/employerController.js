const Job = require('../models/Job');
const Application = require('../models/Application');

// Get jobs posted by employer
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('postedBy', 'name');
    
    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ jobId: job._id });
        return {
          ...job.toObject(),
          applicationCount
        };
      })
    );
    
    res.json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications for employer's jobs
exports.getEmployerApplications = async (req, res) => {
  try {
    // First get all jobs posted by this employer
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(job => job._id);
    
    // Then get all applications for those jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title')
      .populate('applicantId', 'name email');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status (employer only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, interviewDate, interviewTime, interviewLocation } = req.body;
    const applicationId = req.params.id;
    
    // Find the application
    const application = await Application.findById(applicationId)
      .populate('jobId', 'title postedBy');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if the employer owns the job
    if (application.jobId.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }
    
    // Update application
    application.status = status;
    application.updatedAt = Date.now();
    
    // If scheduling interview, add interview details
    if (status === 'Interview' && interviewDate) {
      application.interviewDate = interviewDate;
      application.interviewTime = interviewTime;
      application.interviewLocation = interviewLocation;
    }
    
    await application.save();
    
    // Populate and return updated application
    const updatedApplication = await Application.findById(applicationId)
      .populate('jobId', 'title')
      .populate('applicantId', 'name email');
    
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const jobId = req.params.id;
    
    // Find the job
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if the employer owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    // Update job fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (company) job.company = company;
    if (location) job.location = location;
    if (salary) job.salary = salary;
    
    await job.save();
    
    // Get application count
    const applicationCount = await Application.countDocuments({ jobId: job._id });
    
    res.json({
      ...job.toObject(),
      applicationCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const jobId = req.params.id;
    
    // Find the job
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if the employer owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    // Update job status
    job.status = status;
    await job.save();
    
    // Get application count
    const applicationCount = await Application.countDocuments({ jobId: job._id });
    
    res.json({
      ...job.toObject(),
      applicationCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Find the job
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if the employer owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    // Delete the job
    await Job.findByIdAndDelete(jobId);
    
    // Optionally, delete all applications for this job
    await Application.deleteMany({ jobId });
    
    res.json({ message: 'Job deleted successfully', jobId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};