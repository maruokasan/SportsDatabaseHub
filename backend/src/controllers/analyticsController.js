const ApiError = require('../utils/apiError');
const analyticsService = require('../services/analyticsService');

exports.goalsPer90 = async (_req, res, next) => {
  try {
    const data = await analyticsService.goalsPer90();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.standings = async (_req, res, next) => {
  try {
    const data = await analyticsService.standings();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.headToHead = async (req, res, next) => {
  try {
    const { teamA, teamB } = req.query;
    if (!teamA || !teamB) throw new ApiError(400, 'teamA and teamB query params required');
    const data = await analyticsService.headToHead(teamA, teamB);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.injuryBurden = async (_req, res, next) => {
  try {
    const data = await analyticsService.injuryBurden();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.careerAverages = async (req, res, next) => {
  try {
    const data = await analyticsService.careerAverages(req.query.playerId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.consistency = async (req, res, next) => {
  try {
    const data = await analyticsService.consistency(req.query.playerId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.playerVsTeam = async (req, res, next) => {
  try {
    const { playerId, teamId } = req.query;
    if (!playerId || !teamId) throw new ApiError(400, 'playerId and teamId query params required');
    const data = await analyticsService.playerVsTeam(playerId, teamId);
    if (!data) throw new ApiError(404, 'Player or team not found');
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.topScorers = async (req, res, next) => {
  try {
    const { tournamentId, limit } = req.query;
    if (!tournamentId) throw new ApiError(400, 'tournamentId query param required');
    const data = await analyticsService.topScorersByTournament(tournamentId, limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.playerWinRate = async (_req, res, next) => {
  try {
    const data = await analyticsService.playerWinRate();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.winRateByNationality = async (_req, res, next) => {
  try {
    const data = await analyticsService.winRateByNationality();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.seasonalTrend = async (req, res, next) => {
  try {
    const data = await analyticsService.seasonalTrend(req.query.bucket);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.playerLoadVsActiveInjuries = async (_req, res, next) => {
  try {
    const data = await analyticsService.playerLoadVsActiveInjuries();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.presenceImpact = async (req, res, next) => {
  try {
    const { playerId, teamId, opponentTeamId } = req.query;
    const matchupTeamId = opponentTeamId || teamId;
    if (!playerId || !matchupTeamId) throw new ApiError(400, 'playerId and opponentTeamId query params required');
    const data = await analyticsService.presenceImpact(playerId, matchupTeamId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
