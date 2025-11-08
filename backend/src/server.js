const env = require('./config/env');
const { sequelize } = require('./models');
const seedUsers = require('./seeders/seedUsers');
const seedSampleData = require('./seeders/seedSampleData');
const app = require('./app');

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedUsers();
    await seedSampleData();

    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start API', err);
    process.exit(1);
  }
};

start();
