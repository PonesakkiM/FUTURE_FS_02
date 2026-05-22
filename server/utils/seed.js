/**
 * Seed Script — creates the default admin user
 * Run once: node utils/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Remove existing admin
    await User.deleteOne({ email: 'admin@crm.com' });

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@crm.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin user created:', admin.email);

    // Create a sales user
    await User.deleteOne({ email: 'sales@crm.com' });
    const sales = await User.create({
      name: 'Sales User',
      email: 'sales@crm.com',
      password: 'sales123',
      role: 'sales',
    });
    console.log('✅ Sales user created:', sales.email);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
