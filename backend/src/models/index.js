const sequelize = require('../config/database');

const modelDefiners = [
  require('./user'),
  require('./team'),
  require('./player'),
  require('./tournament'),
  require('./match'),
  require('./playerFamily'),
  require('./playerInjury'),
  require('./score'),
  require('./playerMatchStats')
];

modelDefiners.forEach(defineModel => defineModel(sequelize));

const { models } = sequelize;

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
