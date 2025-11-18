const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header (not cookies)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('No token found in Authorization header');
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Token decoded:', decoded);

    // Get user from token (the token contains 'id', not 'userId')
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User authenticated:', req.user.email, 'Role:', req.user.role);
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization check. User role:', req.user?.role, 'Allowed roles:', roles);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    
    console.log('Authorization successful');
    next();
  };
};

// Specific role middleware
exports.isEmployer = (req, res, next) => {
  if (req.user && req.user.role === 'employer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Employer role required.' });
  }
};

exports.isJobSeeker = (req, res, next) => {
  if (req.user && (req.user.role === 'applicant' || req.user.role === 'jobseeker')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Job seeker role required.' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Optional authentication - doesn't fail if no token
exports.optionalProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User authenticated (optional):', req.user?.email);
    }

    // Continue even if no user
    next();
  } catch (error) {
    console.log('Optional auth failed, continuing without user:', error.message);
    // Continue without user
    next();
  }
};
