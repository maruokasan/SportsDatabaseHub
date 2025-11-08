const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Score = sequelize.define('Score', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    minuteScored: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    goalType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    matchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'matches', key: 'id' },
      field: 'match_id'
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'players', key: 'id' },
      field: 'player_id'
    },
    result: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
      comment: 'Numeric outcome indicator used for win-rate analytics'
    }
  }, {
    tableName: 'scores',
    underscored: true
  });

  Score.associate = (models) => {
    Score.belongsTo(models.Match, { foreignKey: 'matchId', as: 'match' });
    Score.belongsTo(models.Player, { foreignKey: 'playerId', as: 'player' });
  };

  return Score;
};
