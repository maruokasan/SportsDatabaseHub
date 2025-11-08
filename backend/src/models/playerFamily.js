const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlayerFamily = sequelize.define('PlayerFamily', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    relationship: DataTypes.STRING,
    phone: DataTypes.STRING,
    isEmergencyContact: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'players', key: 'id' },
      field: 'player_id'
    }
  }, {
    tableName: 'player_families',
    underscored: true
  });

  PlayerFamily.associate = (models) => {
    PlayerFamily.belongsTo(models.Player, { foreignKey: 'playerId', as: 'player' });
  };

  return PlayerFamily;
};
