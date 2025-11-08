const { Team, Player, Tournament, Match, PlayerMatchStats } = require('../models');

const seedSampleData = async () => {
  const existingPlayers = await Player.count();
  if (existingPlayers > 0) return; // already seeded

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
      homeTeamId: hawks.id,
      awayTeamId: lions.id,
      stadium: 'City Arena',
      referee: 'Maria Ong',
      matchDate: '2025-08-01T12:00:00.000Z',
      status: 'upcoming',
      homeScore: 0,
      awayScore: 0
    }
  ];

  const matches = [];
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
    matches.push(match);
  }

  const completedMatch = matches.find((m) => m.status === 'completed');
  if (completedMatch) {
    const lionsPlayers = players.filter((p) => p.teamId === lions.id);
    const tigersPlayers = players.filter((p) => p.teamId === tigers.id);

    await PlayerMatchStats.upsert({
      playerId: lionsPlayers[0].id,
      matchId: completedMatch.id,
      minutesPlayed: 90,
      goals: 2,
      assists: 0
    });
    await PlayerMatchStats.upsert({
      playerId: lionsPlayers[1].id,
      matchId: completedMatch.id,
      minutesPlayed: 85,
      goals: 0,
      assists: 1
    });
    await PlayerMatchStats.upsert({
      playerId: tigersPlayers[0].id,
      matchId: completedMatch.id,
      minutesPlayed: 90,
      goals: 1,
      assists: 0
    });
  }
};

module.exports = seedSampleData;
