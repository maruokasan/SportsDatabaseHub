const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { User } = require('../models');

const defaultUsers = [
  {
    name: 'Admin User',
    email: 'admin@sports.local',
    role: 'admin',
    password: 'Admin@123'
  },
  {
    name: 'Viewer Analyst',
    email: 'viewer@sports.local',
    role: 'viewer',
    password: 'Viewer@123'
  }
];

const seedUsers = async () => {
  for (const entry of defaultUsers) {
    const existing = await User.findOne({ where: { email: entry.email } });
    if (!existing) {
      const hashed = await bcrypt.hash(entry.password, env.bcryptRounds);
      await User.create({ ...entry, password: hashed });
    }
  }
};

module.exports = seedUsers;
