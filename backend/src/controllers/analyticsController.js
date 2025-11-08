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
