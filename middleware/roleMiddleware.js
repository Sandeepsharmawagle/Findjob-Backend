const User = require('../models/User');

// Role authorization middleware
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Check if user is attached to request (by protect middleware)
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Check if user role is authorized
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: 'User not authorized to access this route'
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
};

module.exports = authorize;