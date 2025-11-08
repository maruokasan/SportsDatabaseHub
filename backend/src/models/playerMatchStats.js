const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlayerMatchStats = sequelize.define('PlayerMatchStats', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    minutesPlayed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    goals: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    assists: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    yellowCards: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    redCards: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    shotsOnTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'players', key: 'id' },
      field: 'player_id'
    },
    matchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'matches', key: 'id' },
      field: 'match_id'
    }
  }, {
    tableName: 'player_match_stats',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['player_id', 'match_id']
      }
    ]
  });

  PlayerMatchStats.associate = (models) => {
    PlayerMatchStats.belongsTo(models.Player, { foreignKey: 'playerId', as: 'player' });
    PlayerMatchStats.belongsTo(models.Match, { foreignKey: 'matchId', as: 'match' });
  };

  return PlayerMatchStats;
};
