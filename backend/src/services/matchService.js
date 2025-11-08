const ApiError = require('../utils/apiError');
const { sequelize, Match, Player, PlayerMatchStats } = require('../models');

const completeMatch = async (matchId, payload = {}, userContext = {}) => {
  const { homeScore = 0, awayScore = 0, playerStats = [] } = payload;

  return sequelize.transaction(async (t) => {
    const match = await Match.findByPk(matchId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!match) throw new ApiError(404, 'Match not found');
    if (match.status === 'completed') throw new ApiError(409, 'Match already completed');

    const teamIds = [match.homeTeamId, match.awayTeamId];
    const playerIds = playerStats.map((p) => p.playerId);

    if (playerIds.length) {
      const players = await Player.findAll({
        where: { id: playerIds },
        transaction: t
      });
      const playerMap = new Map(players.map((p) => [p.id, p]));
      for (const stat of playerStats) {
        const player = playerMap.get(stat.playerId);
        if (!player) throw new ApiError(400, `Player ${stat.playerId} not found`);
        if (!teamIds.includes(player.teamId)) {
          throw new ApiError(400, 'Player must belong to a participating team');
        }
      }
    }

    await match.update(
      {
        homeScore,
        awayScore,
        status: 'completed'
      },
      { transaction: t }
    );

    for (const stat of playerStats) {
      await PlayerMatchStats.upsert(
        {
          playerId: stat.playerId,
          matchId: match.id,
          minutesPlayed: stat.minutesPlayed ?? 0,
          goals: stat.goals ?? 0,
          assists: stat.assists ?? 0,
          yellowCards: stat.yellowCards ?? 0,
          redCards: stat.redCards ?? 0,
          shotsOnTarget: stat.shotsOnTarget ?? 0
        },
        { transaction: t }
      );
    }

    return match;
  });
};

module.exports = {
  completeMatch
};
