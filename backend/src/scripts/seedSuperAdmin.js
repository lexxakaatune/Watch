require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createSuperAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not defined');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const username = process.argv[2] || 'superadmin';
    const email = process.argv[3] || 'superadmin@watch.com';
    const password = process.argv[4] || 'SuperAdmin123!';

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      console.log('Superadmin already exists. Updating role...');
      existing.role = 'superadmin';
      await existing.save();
      console.log('Updated to superadmin');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'superadmin',
      isVerified: true,
      isActive: true
    });

    console.log('SuperAdmin created successfully:');
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log('Login at /api/auth/login');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

createSuperAdmin();
