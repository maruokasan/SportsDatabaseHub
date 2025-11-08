const { Op, fn, col, literal } = require('sequelize');
const { PlayerMatchStats, Player, Match, Team, PlayerInjury, Score, Tournament } = require('../models');

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

const playerLoadVsActiveInjuries = async () => {
  const rows = await Player.findAll({
    attributes: [
      ['id', 'playerId'],
      [col('Player.first_name'), 'firstName'],
      [col('Player.last_name'), 'lastName'],
      [fn('COALESCE', fn('SUM', col('matchStats.minutes_played')), 0), 'minutes'],
      [
        literal(
          "COALESCE(SUM(CASE WHEN injuries.id IS NOT NULL AND (injuries.injury_end IS NULL OR injuries.injury_end >= DATE('now')) THEN 1 ELSE 0 END), 0)"
        ),
        'active_injuries'
      ]
    ],
    include: [
      { model: PlayerMatchStats, as: 'matchStats', attributes: [], required: false },
      { model: PlayerInjury, as: 'injuries', attributes: [], required: false }
    ],
    group: ['Player.id', 'Player.first_name', 'Player.last_name'],
    order: [
      [literal('active_injuries'), 'DESC'],
      [literal('minutes'), 'DESC']
    ],
    raw: true
  });

  return rows;
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

const buildScoreResultRows = async (playerId) => Score.findAll({
  where: {
    ...(playerId ? { playerId } : {}),
    result: { [Op.not]: null }
  },
  attributes: [
    ['player_id', 'playerId'],
    [fn('COUNT', col('Score.id')), 'samples'],
    [fn('SUM', col('Score.result')), 'totalResult'],
    [fn('SUM', literal('Score.result * Score.result')), 'sumResultSquared']
  ],
  include: [{ model: Player, as: 'player', attributes: ['firstName', 'lastName'] }],
  group: ['Score.player_id', 'player.id']
});

const calcStdDev = (sum, sumSquares, count) => {
  const n = Number(count) || 0;
  if (n <= 1) return 0;
  const total = Number(sum) || 0;
  const totalSquares = Number(sumSquares) || 0;
  const numerator = totalSquares - (total ** 2) / n;
  const variance = Math.max(numerator / (n - 1), 0);
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
      totalGoals,
      totalAssists,
      totalMinutes,
      avgGoals: Number(avgGoals.toFixed(2)),
      avgAssists: Number(avgAssists.toFixed(2)),
      avgMinutes: Number(avgMinutes.toFixed(1)),
      avgShotsOnTarget: Number(avgShots.toFixed(2)),
      goalsPer90: Number(goalsPer90.toFixed(2))
    };
  }).sort((a, b) => b.goalsPer90 - a.goalsPer90);
};

const consistency = async (playerId) => {
  const rows = await buildScoreResultRows(playerId);

  return rows.map((row) => {
    const samples = Number(row.get('samples')) || 0;
    const totalResult = Number(row.get('totalResult')) || 0;
    const stdResult = calcStdDev(totalResult, row.get('sumResultSquared'), samples);
    const avgScore = samples ? totalResult / samples : 0;

    return {
      playerId: row.playerId,
      name: `${row.player.firstName} ${row.player.lastName}`.trim(),
      samples,
      avgScore: Number(avgScore.toFixed(2)),
      stdDevScore: stdResult
    };
  }).sort((a, b) => b.avgScore - a.avgScore);
};

const playerVsTeam = async (playerId, teamId) => {
  const [player, opponentTeam] = await Promise.all([
    Player.findByPk(playerId, { attributes: ['id', 'firstName', 'lastName', 'teamId'] }),
    Team.findByPk(teamId, { attributes: ['id', 'name'] })
  ]);

  if (!player || !opponentTeam) return null;

  const matchupFilter = {
    [Op.or]: [
      { homeTeamId: player.teamId, awayTeamId: teamId },
      { homeTeamId: teamId, awayTeamId: player.teamId }
    ],
    status: 'completed'
  };

  const row = await PlayerMatchStats.findOne({
    attributes: [
      ['player_id', 'playerId'],
      [fn('COALESCE', fn('SUM', col('PlayerMatchStats.goals')), 0), 'totalGoals'],
      [fn('COALESCE', fn('SUM', col('PlayerMatchStats.assists')), 0), 'totalAssists'],
      [fn('COALESCE', fn('SUM', col('PlayerMatchStats.minutes_played')), 0), 'totalMinutes'],
      [fn('SUM', literal("CASE WHEN PlayerMatchStats.minutes_played > 0 THEN 1 ELSE 0 END")), 'appearances']
    ],
    include: [
      { model: Match, as: 'match', attributes: [], where: matchupFilter }
    ],
    where: { playerId },
    raw: true
  });

  const totalGoals = Number(row?.totalGoals) || 0;
  const totalAssists = Number(row?.totalAssists) || 0;
  const totalMinutes = Number(row?.totalMinutes) || 0;
  const appearances = Number(row?.appearances) || 0;

  return {
    playerId: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    opponentTeamId: opponentTeam.id,
    opponentTeamName: opponentTeam.name,
    totalGoals,
    totalAssists,
    totalMinutes,
    appearances
  };
};

const topScorersByTournament = async (tournamentId, limit = 10) => {
  if (!tournamentId) return [];

  const rows = await PlayerMatchStats.findAll({
    attributes: [
      ['player_id', 'playerId'],
      [fn('COALESCE', fn('SUM', col('PlayerMatchStats.goals')), 0), 'totalGoals'],
      [fn('COALESCE', fn('SUM', col('PlayerMatchStats.assists')), 0), 'totalAssists'],
      [fn('COALESCE', fn('SUM', col('PlayerMatchStats.minutes_played')), 0), 'totalMinutes'],
      [fn('SUM', literal("CASE WHEN PlayerMatchStats.minutes_played > 0 THEN 1 ELSE 0 END")), 'appearances']
    ],
    include: [
      { model: Player, as: 'player', attributes: ['firstName', 'lastName', 'teamId'] },
      { model: Match, as: 'match', attributes: [], where: { tournamentId, status: 'completed' } }
    ],
    group: ['PlayerMatchStats.player_id', 'player.id', 'player.first_name', 'player.last_name', 'player.team_id'],
    order: [[fn('COALESCE', fn('SUM', col('PlayerMatchStats.goals')), 0), 'DESC']],
    limit: Number(limit) || 10,
    raw: true
  });

  const tournament = await Tournament.findByPk(tournamentId, { attributes: ['id', 'name'] });

  return rows.map((row, index) => {
    const totalGoals = Number(row.totalGoals) || 0;
    const totalAssists = Number(row.totalAssists) || 0;
    return {
      rank: index + 1,
      playerId: row.playerId,
      firstName: row['player.firstName'] || row.firstName,
      lastName: row['player.lastName'] || row.lastName,
      teamId: row['player.teamId'] || row.teamId,
      totalGoals,
      totalAssists,
      appearances: Number(row.appearances) || 0,
      totalMinutes: Number(row.totalMinutes) || 0,
      totalPoints: totalGoals + totalAssists,
      tournamentId: tournament?.id || tournamentId,
      tournamentName: tournament?.name || 'Tournament'
    };
  });
};

const playerWinRate = async () => {
  const rows = await Score.findAll({
    attributes: [
      ['player_id', 'playerId'],
      [col('player.first_name'), 'firstName'],
      [col('player.last_name'), 'lastName'],
      [fn('AVG', col('Score.result')), 'avgResult']
    ],
    include: [{ model: Player, as: 'player', attributes: [] }],
    group: ['Score.player_id', 'player.id', 'player.first_name', 'player.last_name'],
    order: [[fn('AVG', col('Score.result')), 'DESC']],
    raw: true
  });

  return rows.map((row) => ({
    playerId: row.playerId,
    firstName: row.firstName,
    lastName: row.lastName,
    avgResult: row.avgResult == null ? null : Number(row.avgResult)
  }));
};

const winRateByNationality = async () => {
  const rows = await Score.findAll({
    attributes: [
      [col('player.nationality'), 'nationality'],
      [fn('AVG', col('Score.result')), 'avg_result'],
      [fn('COUNT', col('Score.player_id')), 'n_samples']
    ],
    include: [{ model: Player, as: 'player', attributes: [] }],
    group: ['player.nationality'],
    order: [[fn('AVG', col('Score.result')), 'DESC']],
    raw: true
  });

  return rows.map((row) => ({
    nationality: row.nationality,
    avg_result: row.avg_result == null ? null : Number(row.avg_result),
    n_samples: Number(row.n_samples) || 0
  }));
};

const BUCKET_FORMATS = {
  day: '%Y-%m-%d',
  week: '%Y-W%W',
  month: '%Y-%m-01'
};

const seasonalTrend = async (bucket = 'month') => {
  const format = BUCKET_FORMATS[bucket] ?? BUCKET_FORMATS.month;
  const bucketExpression = fn('strftime', format, col('match.match_date'));

  const rows = await Score.findAll({
    attributes: [
      [bucketExpression, 'bucket_label'],
      [fn('AVG', col('Score.result')), 'avg_result']
    ],
    include: [{ model: Match, as: 'match', attributes: [] }],
    group: [bucketExpression],
    order: [[bucketExpression, 'ASC']],
    raw: true
  });

  return rows.map((row) => ({
    month_bucket: row.bucket_label,
    bucket_label: row.bucket_label,
    avg_result: row.avg_result == null ? null : Number(row.avg_result)
  }));
};

const presenceImpact = async (playerId, opponentTeamId) => {
  if (!playerId || !opponentTeamId) return [];

  const player = await Player.findByPk(playerId, { attributes: ['id', 'teamId'] });
  if (!player?.teamId) return [];

  const matches = await Match.findAll({
    where: {
      status: 'completed',
      [Op.or]: [
        { homeTeamId: player.teamId, awayTeamId: opponentTeamId },
        { homeTeamId: opponentTeamId, awayTeamId: player.teamId }
      ]
    },
    attributes: ['id', 'homeTeamId', 'awayTeamId', 'homeScore', 'awayScore'],
    include: [
      {
        model: PlayerMatchStats,
        as: 'playerStats',
        attributes: ['playerId', 'minutesPlayed'],
        where: { playerId },
        required: false
      }
    ]
  });

  if (!matches.length) return [];

  const aggregates = matches.reduce((acc, match) => {
    const played = match.playerStats?.some((stat) => stat.playerId === playerId && Number(stat.minutesPlayed) > 0);
    const teamScore = match.homeTeamId === player.teamId ? match.homeScore : match.awayScore;
    if (teamScore == null) return acc;

    const key = played ? 'with' : 'without';
    if (!acc[key]) {
      acc[key] = { is_present: played, total: 0, samples: 0 };
    }
    acc[key].total += Number(teamScore) || 0;
    acc[key].samples += 1;
    return acc;
  }, {});

  return Object.values(aggregates)
    .map((bucket) => ({
      is_present: bucket.is_present,
      avg_result: bucket.samples ? Number((bucket.total / bucket.samples).toFixed(2)) : 0,
      samples: bucket.samples
    }))
    .sort((a, b) => Number(b.is_present) - Number(a.is_present));
};

module.exports = {
  goalsPer90,
  standings,
  headToHead,
  injuryBurden,
  careerAverages,
  consistency,
  playerWinRate,
  winRateByNationality,
  seasonalTrend,
  playerLoadVsActiveInjuries,
  playerVsTeam,
  topScorersByTournament,
  presenceImpact
};
