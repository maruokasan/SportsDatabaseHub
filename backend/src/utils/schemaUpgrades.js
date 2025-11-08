const { DataTypes } = require('sequelize');
const { sequelize } = require('../models');

const ensureScoreResultColumn = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable('scores');
  if (!columns.result) {
    await queryInterface.addColumn('scores', 'result', {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
      comment: 'Numeric outcome indicator used for win-rate analytics'
    });
  }
};

const runSchemaUpgrades = async () => {
  await ensureScoreResultColumn();
};

module.exports = runSchemaUpgrades;
