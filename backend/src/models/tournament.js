const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tournament = sequelize.define('Tournament', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'tournaments',
    underscored: true
  });

  Tournament.associate = (models) => {
    Tournament.hasMany(models.Match, { foreignKey: 'tournamentId', as: 'matches' });
  };

  return Tournament;
};
