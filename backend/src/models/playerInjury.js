const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlayerInjury = sequelize.define('PlayerInjury', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    injuryStart: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    injuryEnd: DataTypes.DATEONLY,
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'low'
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'players', key: 'id' },
      field: 'player_id'
    }
  }, {
    tableName: 'player_injuries',
    underscored: true
  });

  PlayerInjury.associate = (models) => {
    PlayerInjury.belongsTo(models.Player, { foreignKey: 'playerId', as: 'player' });
  };

  return PlayerInjury;
};
