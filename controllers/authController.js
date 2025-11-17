const User = require('../models/User');
const { generateToken } = require('../config/auth');

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('Registration request received:', { name, email, role });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'applicant'
    });
    
    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);

    // Send response with cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }).status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login request received:', { email });

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send response with cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out successfully' });
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Use req.user directly since it's already attached by the auth middleware
    // req.user is the full user object from the database with password excluded
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};