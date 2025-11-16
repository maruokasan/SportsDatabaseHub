const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Match = sequelize.define(
    "Match",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      stadium: DataTypes.STRING,
      referee: DataTypes.STRING,
      matchDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("upcoming", "live", "completed", "postponed"),
        allowNull: false,
        defaultValue: "upcoming",
      },
      homeScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      awayScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tournamentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "tournaments", key: "id" },
        field: "tournament_id",
      },
      homeTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teams", key: "id" },
        field: "home_team_id",
      },
      awayTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teams", key: "id" },
        field: "away_team_id",
      },
      season: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "matches",
      underscored: true,
      validate: {
        teamsNotSame() {
          if (
            this.homeTeamId &&
            this.awayTeamId &&
            this.homeTeamId === this.awayTeamId
          ) {
            throw new Error("Home and away teams must differ");
          }
        },
      },
    }
  );

  Match.associate = (models) => {
    Match.belongsTo(models.Tournament, {
      foreignKey: "tournamentId",
      as: "tournament",
    });
    Match.belongsTo(models.Team, { foreignKey: "homeTeamId", as: "homeTeam" });
    Match.belongsTo(models.Team, { foreignKey: "awayTeamId", as: "awayTeam" });
    Match.hasMany(models.Score, { foreignKey: "matchId", as: "scores" });
    Match.hasMany(models.PlayerMatchStats, {
      foreignKey: "matchId",
      as: "playerStats",
    });
  };

  return Match;
};
