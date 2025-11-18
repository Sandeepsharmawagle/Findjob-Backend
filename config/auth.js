const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {  // ← Changed parameter name
  return jwt.sign({ id }, process.env.JWT_SECRET, {  // ← Changed to { id }
    expiresIn: '30d'  // Changed to 30 days
  });
};

module.exports = {
  generateToken
};
