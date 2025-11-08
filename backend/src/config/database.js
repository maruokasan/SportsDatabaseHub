const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.db.storage,
  logging: env.db.logging ? console.log : false
});

module.exports = sequelize;
