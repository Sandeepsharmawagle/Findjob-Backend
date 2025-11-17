const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Get user from token
    req.user = await User.findById(decoded.userId).select('-password');
    
    console.log('User authenticated:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization check. User role:', req.user.role, 'Allowed roles:', roles);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'User not authorized to access this route'
      });
    }
    console.log('Authorization successful');
    next();
  };
};

// Optional authentication - doesn't fail if no token
exports.optionalProtect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (token) {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Get user from token
      req.user = await User.findById(decoded.userId).select('-password');
      console.log('User authenticated (optional):', req.user);
    }
    
    // Continue even if no user (optional auth)
    next();
  } catch (error) {
    console.log('Optional auth failed, continuing without user:', error.message);
    // Continue without user
    next();
  }
};