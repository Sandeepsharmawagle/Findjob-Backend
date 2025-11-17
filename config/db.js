const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Fix strictQuery deprecation warning
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    // Remove useNewUrlParser and useUnifiedTopology - they're deprecated
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal'
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
