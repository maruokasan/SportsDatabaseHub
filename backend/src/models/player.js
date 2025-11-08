const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthdate: DataTypes.DATEONLY,
    nationality: DataTypes.STRING,
    position: DataTypes.STRING,
    jerseyNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'teams', key: 'id' },
      field: 'team_id'
    }
  }, {
    tableName: 'players',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['team_id', 'jersey_number']
      }
    ]
  });

  Player.associate = (models) => {
    Player.belongsTo(models.Team, { foreignKey: 'teamId', as: 'team' });
    Player.hasMany(models.PlayerFamily, { foreignKey: 'playerId', as: 'familyContacts' });
    Player.hasMany(models.PlayerInjury, { foreignKey: 'playerId', as: 'injuries' });
    Player.hasMany(models.PlayerMatchStats, { foreignKey: 'playerId', as: 'matchStats' });
    Player.hasMany(models.Score, { foreignKey: 'playerId', as: 'scores' });
  };

  return Player;
};
