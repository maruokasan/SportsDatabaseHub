const { Op, fn, col, literal } = require('sequelize');
const { sequelize, PlayerMatchStats, Player, Match, Team, PlayerInjury } = require('../models');

const goalsPer90 = async () => {
  const rows = await PlayerMatchStats.findAll({
    attributes: [
      ['player_id', 'playerId'],
      [fn('SUM', col('PlayerMatchStats.goals')), 'totalGoals'],
      [fn('SUM', col('PlayerMatchStats.minutes_played')), 'totalMinutes']
    ],
    include: [{ model: Player, as: 'player', attributes: ['firstName', 'lastName', 'teamId'] }],
    group: ['player_id', 'player.id']
  });

  return rows
    .map((row) => {
      const minutes = Number(row.get('totalMinutes')) || 0;
      const goals = Number(row.get('totalGoals')) || 0;
      const per90 = minutes ? (goals / minutes) * 90 : 0;
      return {
        playerId: row.playerId,
        name: `${row.player.firstName} ${row.player.lastName}`.trim(),
        teamId: row.player.teamId,
        goals,
        minutes,
        goalsPer90: Number(per90.toFixed(2))
      };
    })
    .sort((a, b) => b.goalsPer90 - a.goalsPer90);
};

const computeGoalsForTeam = (stats, teamId) =>
  stats
    .filter((stat) => stat.player?.teamId === teamId)
    .reduce((sum, stat) => sum + (stat.goals || 0), 0);

const standings = async () => {
  const matches = await Match.findAll({
    where: { status: 'completed' },
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
      {
        model: PlayerMatchStats,
        as: 'playerStats',
        include: [{ model: Player, as: 'player', attributes: ['id', 'teamId'] }]
      }
    ]
  });

  const table = new Map();
  const ensureTeam = (team) => {
    if (!table.has(team.id)) {
      table.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      });
    }
    return table.get(team.id);
  };

  matches.forEach((match) => {
    const homeGoals = computeGoalsForTeam(match.playerStats, match.homeTeamId);
    const awayGoals = computeGoalsForTeam(match.playerStats, match.awayTeamId);
    const home = ensureTeam(match.homeTeam);
    const away = ensureTeam(match.awayTeam);

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (homeGoals < awayGoals) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  return Array.from(table.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const goalDiffA = a.goalsFor - a.goalsAgainst;
    const goalDiffB = b.goalsFor - b.goalsAgainst;
    if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;
    return a.teamName.localeCompare(b.teamName);
  });
};

const headToHead = async (teamA, teamB) => {
  const matches = await Match.findAll({
    where: {
      status: 'completed',
      [Op.or]: [
        { homeTeamId: teamA, awayTeamId: teamB },
        { homeTeamId: teamB, awayTeamId: teamA }
      ]
    },
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
      {
        model: PlayerMatchStats,
        as: 'playerStats',
        include: [{ model: Player, as: 'player', attributes: ['id', 'teamId'] }]
      }
    ],
    order: [['matchDate', 'DESC']]
  });

  const summary = { teamA: { id: teamA, wins: 0 }, teamB: { id: teamB, wins: 0 }, draws: 0 };

  const details = matches.map((match) => {
    const homeGoals = computeGoalsForTeam(match.playerStats, match.homeTeamId);
    const awayGoals = computeGoalsForTeam(match.playerStats, match.awayTeamId);
    if (homeGoals === awayGoals) summary.draws += 1;
    else if (match.homeTeamId === teamA && homeGoals > awayGoals) summary.teamA.wins += 1;
    else if (match.awayTeamId === teamA && awayGoals > homeGoals) summary.teamA.wins += 1;
    else summary.teamB.wins += 1;

    return {
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      score: `${homeGoals} - ${awayGoals}`,
      date: match.matchDate
    };
  });

  return { summary, details };
};

const injuryBurden = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const injuries = await PlayerInjury.findAll({
    where: {
      [Op.or]: [
        { injuryEnd: null },
        { injuryEnd: { [Op.gt]: today } }
      ]
    },
    include: [{ model: Player, as: 'player', attributes: ['teamId'] }]
  });

  const map = new Map();
  injuries.forEach((injury) => {
    const teamId = injury.player?.teamId;
    if (!teamId) return;
    map.set(teamId, (map.get(teamId) || 0) + 1);
  });

  const teams = await Team.findAll({
    where: map.size ? { id: Array.from(map.keys()) } : undefined,
    attributes: ['id', 'name']
  });
  const teamMap = new Map(teams.map((t) => [t.id, t.name]));

  return Array.from(map.entries()).map(([teamId, count]) => ({
    teamId,
    teamName: teamMap.get(teamId) || 'Unknown',
    activeInjuries: count
  }));
};

const buildPlayerStatRows = async (playerId) => PlayerMatchStats.findAll({
  where: playerId ? { playerId } : undefined,
  attributes: [
    ['player_id', 'playerId'],
    [fn('COUNT', col('PlayerMatchStats.match_id')), 'matches'],
    [fn('SUM', col('PlayerMatchStats.minutes_played')), 'totalMinutes'],
    [fn('SUM', col('PlayerMatchStats.goals')), 'totalGoals'],
    [fn('SUM', col('PlayerMatchStats.assists')), 'totalAssists'],
    [fn('SUM', col('PlayerMatchStats.shots_on_target')), 'totalShotsOnTarget'],
    [fn('SUM', literal('PlayerMatchStats.goals * PlayerMatchStats.goals')), 'sumGoalsSquared'],
    [fn('SUM', literal('PlayerMatchStats.assists * PlayerMatchStats.assists')), 'sumAssistsSquared']
  ],
  include: [{ model: Player, as: 'player', attributes: ['firstName', 'lastName', 'teamId'] }],
  group: ['player_id', 'player.id']
});

const calcStdDev = (sum, sumSquares, count) => {
  const n = Number(count) || 0;
  if (n <= 1) return 0;
  const total = Number(sum) || 0;
  const totalSquares = Number(sumSquares) || 0;
  const mean = total / n;
  const meanSquares = totalSquares / n;
  const variance = Math.max(meanSquares - mean ** 2, 0);
  return Number(Math.sqrt(variance).toFixed(2));
};

const careerAverages = async (playerId) => {
  const rows = await buildPlayerStatRows(playerId);

  return rows.map((row) => {
    const matches = Number(row.get('matches')) || 0;
    const totalMinutes = Number(row.get('totalMinutes')) || 0;
    const totalGoals = Number(row.get('totalGoals')) || 0;
    const totalAssists = Number(row.get('totalAssists')) || 0;
    const totalShots = Number(row.get('totalShotsOnTarget')) || 0;
    const avgGoals = matches ? totalGoals / matches : 0;
    const avgAssists = matches ? totalAssists / matches : 0;
    const avgMinutes = matches ? totalMinutes / matches : 0;
    const avgShots = matches ? totalShots / matches : 0;
    const goalsPer90 = totalMinutes ? (totalGoals / totalMinutes) * 90 : 0;

    return {
      playerId: row.playerId,
      name: `${row.player.firstName} ${row.player.lastName}`.trim(),
      teamId: row.player.teamId,
      matches,
      avgGoals: Number(avgGoals.toFixed(2)),
      avgAssists: Number(avgAssists.toFixed(2)),
      avgMinutes: Number(avgMinutes.toFixed(1)),
      avgShotsOnTarget: Number(avgShots.toFixed(2)),
      goalsPer90: Number(goalsPer90.toFixed(2))
    };
  }).sort((a, b) => b.goalsPer90 - a.goalsPer90);
};

const consistency = async (playerId) => {
  const rows = await buildPlayerStatRows(playerId);

  return rows.map((row) => {
    const matches = Number(row.get('matches')) || 0;
    const totalGoals = Number(row.get('totalGoals')) || 0;
    const totalAssists = Number(row.get('totalAssists')) || 0;
    const stdGoals = calcStdDev(totalGoals, row.get('sumGoalsSquared'), matches);
    const stdAssists = calcStdDev(totalAssists, row.get('sumAssistsSquared'), matches);
    const avgGoals = matches ? totalGoals / matches : 0;
    const avgAssists = matches ? totalAssists / matches : 0;

    return {
      playerId: row.playerId,
      name: `${row.player.firstName} ${row.player.lastName}`.trim(),
      matches,
      avgGoals: Number(avgGoals.toFixed(2)),
      avgAssists: Number(avgAssists.toFixed(2)),
      stdDevGoals: stdGoals,
      stdDevAssists: stdAssists
    };
  }).sort((a, b) => b.stdDevGoals - a.stdDevGoals);
};

module.exports = {
  goalsPer90,
  standings,
  headToHead,
  injuryBurden,
  careerAverages,
  consistency
};
