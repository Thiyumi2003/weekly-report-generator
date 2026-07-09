const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const WeeklyReport = require('./models/WeeklyReport');

dotenv.config();

const managerData = {
  name: 'System Manager',
  email: 'manager@gmail.com',
  password: 'manager123',
  role: 'Manager',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=System%20Manager'
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teampulse');
    console.log('Connected to MongoDB database...');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await WeeklyReport.deleteMany({});
    console.log('Cleared all existing database data (users, projects, reports).');

    // Seed the Manager User
    const manager = await User.create(managerData);
    console.log(`Created Manager user: ${manager.email}`);

    console.log('Database successfully seeded with clean manager credential.');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
