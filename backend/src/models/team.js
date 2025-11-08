const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Team = sequelize.define('Team', {
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
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    logoUrl: {
      type: DataTypes.STRING,
      field: 'logo_url'
    }
  }, {
    tableName: 'teams',
    underscored: true
  });

  Team.associate = (models) => {
    Team.hasMany(models.Player, { foreignKey: 'teamId', as: 'players' });
    Team.hasMany(models.Match, { foreignKey: 'homeTeamId', as: 'homeMatches' });
    Team.hasMany(models.Match, { foreignKey: 'awayTeamId', as: 'awayMatches' });
  };

  return Team;
};
