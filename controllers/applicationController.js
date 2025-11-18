const Application = require('../models/Application');
const Job = require('../models/Job');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF and Word documents
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

exports.uploadResume = upload.single('resume');

// Apply for job
exports.applyForJob = async (req, res) => {
  try {
    console.log('Application submission received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User:', req.user);
    
    const { jobId, coverLetter, email, phone } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.user._id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Check if resume was uploaded
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'Please upload your resume' });
    }

    // Validate email and phone
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    console.log('Creating application with data:', {
      jobId,
      applicantId: req.user._id,
      resumeUrl: `/uploads/${req.file.filename}`,
      email,
      phone
    });
    
    // Create application
    const application = await Application.create({
      jobId,
      applicantId: req.user._id,
      resumeUrl: `/uploads/${req.file.filename}`,
      coverLetter: coverLetter || '',
      email,
      phone
    });
    
    console.log('Application created successfully:', application._id);
    res.status(201).json(application);
  } catch (error) {
    console.error('Application submission error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.user._id })
      .populate('jobId', 'title company location')
      .populate('applicantId', 'name');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications for a job (employer)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    // Check if job exists and user is authorized
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }
    
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('applicantId', 'name email')
      .populate('jobId', 'title');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('jobId', 'title')
     .populate('applicantId', 'name email');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};