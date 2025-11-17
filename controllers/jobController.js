const Job = require('../models/Job');

// Create job
exports.createJob = async (req, res) => {
  try {
    console.log('Job creation request received:', req.body);
    console.log('User info:', req.user);
    
    const { title, description, company, location, salary } = req.body;
    
    // Validate required fields
    if (!title || !description || !company || !location || !salary) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      postedBy: req.user._id
    });
    
    console.log('Job created successfully:', job);
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all jobs
exports.getJobs = async (req, res) => {
  try {
    const { location, company, search } = req.query;
    let query = {};
    
    // Only show active jobs
    query.status = { $in: ['Active', undefined, null] };
    
    // Apply filters
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    if (company) {
      query.company = new RegExp(company, 'i');
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const jobs = await Job.find(query).populate('postedBy', 'name');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user is authorized to update this job
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user is authorized to delete this job
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    await job.remove();
    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get jobs with application status for logged-in user
exports.getJobsWithApplicationStatus = async (req, res) => {
  try {
    const Application = require('../models/Application');
    const { location, company, search } = req.query;
    let query = {};
    
    // Only show active jobs
    query.status = { $in: ['Active', undefined, null] };
    
    // Apply filters
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    if (company) {
      query.company = new RegExp(company, 'i');
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const jobs = await Job.find(query).populate('postedBy', 'name');
    
    // If user is logged in, check application status for each job
    if (req.user) {
      const jobsWithStatus = await Promise.all(
        jobs.map(async (job) => {
          const application = await Application.findOne({
            jobId: job._id,
            applicantId: req.user._id
          });
          
          return {
            ...job.toObject(),
            hasApplied: !!application,
            applicationStatus: application ? application.status : null
          };
        })
      );
      
      return res.json(jobsWithStatus);
    }
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};