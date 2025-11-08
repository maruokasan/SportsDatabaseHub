const { Team, Player, Tournament, Match, PlayerMatchStats, Score, PlayerInjury } = require('../models');

const buildMatchKey = ({ homeTeamId, awayTeamId, matchDate }) => `${homeTeamId}:${awayTeamId}:${matchDate}`;

const seedMatchData = async ({ match, stats = [], scores = [] }, playerLookup) => {
  if (!match || match.status !== 'completed') return;

  for (const stat of stats) {
    const player = playerLookup.get(stat.player);
    if (!player) continue;
    await PlayerMatchStats.upsert({
      playerId: player.id,
      matchId: match.id,
      minutesPlayed: stat.minutesPlayed ?? 0,
      goals: stat.goals ?? 0,
      assists: stat.assists ?? 0,
      shotsOnTarget: stat.shotsOnTarget ?? 0,
      yellowCards: stat.yellowCards ?? 0,
      redCards: stat.redCards ?? 0
    });
  }

  await Score.destroy({ where: { matchId: match.id } });
  for (const entry of scores) {
    const player = playerLookup.get(entry.player);
    if (!player) continue;
    await Score.create({
      playerId: player.id,
      matchId: match.id,
      minuteScored: entry.minuteScored,
      goalType: entry.goalType ?? 'open_play',
      result: entry.result ?? null
    });
  }
};

const seedSampleData = async () => {
  const teamPayloads = [
    { name: 'Lions FC', city: 'Singapore', country: 'Singapore' },
    { name: 'Tigers United', city: 'Kuala Lumpur', country: 'Malaysia' },
    { name: 'Hawks City', city: 'Jakarta', country: 'Indonesia' }
  ];

  const teams = [];
  for (const payload of teamPayloads) {
    const [team] = await Team.findOrCreate({ where: { name: payload.name }, defaults: payload });
    teams.push(team);
  }
  const [lions, tigers, hawks] = teams;

  const [tournament] = await Tournament.findOrCreate({
    where: { name: 'Premier Cup 2025' },
    defaults: { name: 'Premier Cup 2025', startDate: '2025-06-01', endDate: '2025-09-30' }
  });

  const playerPayloads = [
    { firstName: 'Amir', lastName: 'Rahman', position: 'FW', nationality: 'SGP', jerseyNumber: 9, teamId: lions.id },
    { firstName: 'Daniel', lastName: 'Khoo', position: 'MF', nationality: 'SGP', jerseyNumber: 8, teamId: lions.id },
    { firstName: 'Hafiz', lastName: 'Azmi', position: 'FW', nationality: 'MAS', jerseyNumber: 11, teamId: tigers.id },
    { firstName: 'Rizal', lastName: 'Ibrahim', position: 'GK', nationality: 'MAS', jerseyNumber: 1, teamId: tigers.id },
    { firstName: 'Aditya', lastName: 'Putra', position: 'DF', nationality: 'IDN', jerseyNumber: 4, teamId: hawks.id },
    { firstName: 'Suryo', lastName: 'Pranata', position: 'MF', nationality: 'IDN', jerseyNumber: 7, teamId: hawks.id }
  ];

  const players = [];
  for (const payload of playerPayloads) {
    const [player] = await Player.findOrCreate({
      where: { firstName: payload.firstName, lastName: payload.lastName },
      defaults: payload
    });
    players.push(player);
  }
  const playerLookup = new Map(players.map((p) => [`${p.firstName} ${p.lastName}`, p]));

  const matchPayloads = [
    {
      tournamentId: tournament.id,
      homeTeamId: lions.id,
      awayTeamId: tigers.id,
      stadium: 'National Stadium',
      referee: 'Alex Tan',
      matchDate: '2025-07-10T12:00:00.000Z',
      status: 'completed',
      homeScore: 2,
      awayScore: 1
    },
    {
      tournamentId: tournament.id,
      homeTeamId: tigers.id,
      awayTeamId: hawks.id,
      stadium: 'Bukit Jalil',
      referee: 'Sakti Noor',
      matchDate: '2025-07-18T11:00:00.000Z',
      status: 'completed',
      homeScore: 2,
      awayScore: 2
    },
    {
      tournamentId: tournament.id,
      homeTeamId: hawks.id,
      awayTeamId: lions.id,
      stadium: 'City Arena',
      referee: 'Maria Ong',
      matchDate: '2025-07-25T13:00:00.000Z',
      status: 'completed',
      homeScore: 0,
      awayScore: 3
    },
    {
      tournamentId: tournament.id,
      homeTeamId: lions.id,
      awayTeamId: hawks.id,
      stadium: 'National Stadium',
      referee: 'Alex Tan',
      matchDate: '2025-08-12T12:00:00.000Z',
      status: 'upcoming',
      homeScore: 0,
      awayScore: 0
    }
  ];

  const matchMap = new Map();
  for (const payload of matchPayloads) {
    const [match] = await Match.findOrCreate({
      where: {
        tournamentId: payload.tournamentId,
        homeTeamId: payload.homeTeamId,
        awayTeamId: payload.awayTeamId,
        matchDate: payload.matchDate
      },
      defaults: payload
    });
    if (match.status !== payload.status || match.homeScore !== payload.homeScore || match.awayScore !== payload.awayScore) {
      await match.update({
        status: payload.status,
        homeScore: payload.homeScore,
        awayScore: payload.awayScore
      });
    }
    matchMap.set(buildMatchKey(payload), match);
  }

  const matchDetails = [
    {
      key: buildMatchKey(matchPayloads[0]),
      stats: [
        { player: 'Amir Rahman', minutesPlayed: 90, goals: 2, assists: 0, shotsOnTarget: 4 },
        { player: 'Daniel Khoo', minutesPlayed: 85, goals: 0, assists: 1, shotsOnTarget: 2 },
        { player: 'Hafiz Azmi', minutesPlayed: 90, goals: 1, assists: 0, shotsOnTarget: 3 },
        { player: 'Rizal Ibrahim', minutesPlayed: 90, goals: 0, assists: 0, shotsOnTarget: 0 }
      ],
      scores: [
        { player: 'Amir Rahman', minuteScored: 23, goalType: 'open_play', result: 1 },
        { player: 'Amir Rahman', minuteScored: 77, goalType: 'header', result: 1 },
        { player: 'Hafiz Azmi', minuteScored: 61, goalType: 'open_play', result: 0 }
      ]
    },
    {
      key: buildMatchKey(matchPayloads[1]),
      stats: [
        { player: 'Hafiz Azmi', minutesPlayed: 90, goals: 2, assists: 0, shotsOnTarget: 5 },
        { player: 'Rizal Ibrahim', minutesPlayed: 90, goals: 0, assists: 0, shotsOnTarget: 0 },
        { player: 'Aditya Putra', minutesPlayed: 90, goals: 1, assists: 0, shotsOnTarget: 1 },
        { player: 'Suryo Pranata', minutesPlayed: 88, goals: 1, assists: 1, shotsOnTarget: 2 }
      ],
      scores: [
        { player: 'Hafiz Azmi', minuteScored: 14, goalType: 'open_play', result: 0.5 },
        { player: 'Aditya Putra', minuteScored: 40, goalType: 'set_piece', result: 0.5 },
        { player: 'Hafiz Azmi', minuteScored: 70, goalType: 'penalty', result: 0.5 },
        { player: 'Suryo Pranata', minuteScored: 85, goalType: 'open_play', result: 0.5 }
      ]
    },
    {
      key: buildMatchKey(matchPayloads[2]),
      stats: [
        { player: 'Aditya Putra', minutesPlayed: 90, goals: 0, assists: 0, shotsOnTarget: 1 },
        { player: 'Suryo Pranata', minutesPlayed: 90, goals: 0, assists: 0, shotsOnTarget: 1 },
        { player: 'Amir Rahman', minutesPlayed: 88, goals: 2, assists: 0, shotsOnTarget: 5 },
        { player: 'Daniel Khoo', minutesPlayed: 90, goals: 1, assists: 2, shotsOnTarget: 3 }
      ],
      scores: [
        { player: 'Amir Rahman', minuteScored: 12, goalType: 'open_play', result: 1 },
        { player: 'Daniel Khoo', minuteScored: 44, goalType: 'long_range', result: 1 },
        { player: 'Amir Rahman', minuteScored: 78, goalType: 'counter', result: 1 }
      ]
    }
  ];

  for (const detail of matchDetails) {
    await seedMatchData({ match: matchMap.get(detail.key), stats: detail.stats, scores: detail.scores }, playerLookup);
  }

  const injuries = [
    { player: 'Daniel Khoo', injuryStart: '2025-07-15', injuryEnd: null, severity: 'medium' },
    { player: 'Suryo Pranata', injuryStart: '2025-07-05', injuryEnd: '2025-07-20', severity: 'low' }
  ];

  for (const injury of injuries) {
    const player = playerLookup.get(injury.player);
    if (!player) continue;
    const payload = {
      playerId: player.id,
      injuryStart: injury.injuryStart,
      injuryEnd: injury.injuryEnd,
      severity: injury.severity
    };
    const [record] = await PlayerInjury.findOrCreate({
      where: { playerId: player.id, injuryStart: injury.injuryStart },
      defaults: payload
    });
    await record.update(payload);
  }
};

module.exports = seedSampleData;
