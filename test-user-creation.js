const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log('Testing user creation...');

// Test user creation
const testUser = async () => {
  try {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'applicant'
    });
    console.log('User created successfully:', user);
  } catch (error) {
    console.error('Error creating user:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

testUser();