const ApiError = require('../utils/apiError');
const { sequelize, Match, Player, PlayerMatchStats, Score } = require('../models');

const deriveResultValue = ({ homeScore, awayScore, playerTeamId, match }) => {
  if (!playerTeamId || !match) return null;
  if (homeScore === awayScore) return 0.5;
  const playerIsHome = match.homeTeamId === playerTeamId;
  const didWin = playerIsHome ? homeScore > awayScore : awayScore > homeScore;
  return didWin ? 1 : 0;
};

const completeMatch = async (matchId, payload = {}, userContext = {}) => {
  const { homeScore = 0, awayScore = 0, playerStats = [], scoringEvents = [] } = payload;

  return sequelize.transaction(async (t) => {
    const match = await Match.findByPk(matchId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!match) throw new ApiError(404, 'Match not found');
    if (match.status === 'completed') throw new ApiError(409, 'Match already completed');

    const teamIds = [match.homeTeamId, match.awayTeamId];
    const playerIds = [...new Set([...playerStats, ...scoringEvents].map((p) => p.playerId))];
    const playerMap = new Map();

    if (playerIds.length) {
      const players = await Player.findAll({
        where: { id: playerIds },
        transaction: t
      });
      players.forEach((p) => playerMap.set(p.id, p));
      for (const stat of playerStats) {
        const player = playerMap.get(stat.playerId);
        if (!player) throw new ApiError(400, `Player ${stat.playerId} not found`);
        if (!teamIds.includes(player.teamId)) {
          throw new ApiError(400, 'Player must belong to a participating team');
        }
      }
      for (const event of scoringEvents) {
        const player = playerMap.get(event.playerId);
        if (!player) throw new ApiError(400, `Player ${event.playerId} not found`);
        if (!teamIds.includes(player.teamId)) {
          throw new ApiError(400, 'Scoring player must belong to a participating team');
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

    await Score.destroy({ where: { matchId: match.id }, transaction: t });
    if (scoringEvents.length) {
      for (const event of scoringEvents) {
        if (typeof event.minuteScored !== 'number') {
          throw new ApiError(400, 'minuteScored is required for scoring events');
        }
        const resultValue = deriveResultValue({
          homeScore,
          awayScore,
          playerTeamId: playerMap.get(event.playerId)?.teamId,
          match
        });
        await Score.create(
          {
            playerId: event.playerId,
            matchId: match.id,
            minuteScored: event.minuteScored,
            goalType: event.goalType || 'open_play',
            result: resultValue
          },
          { transaction: t }
        );
      }
    }

    return match;
  });
};

module.exports = {
  completeMatch
};
