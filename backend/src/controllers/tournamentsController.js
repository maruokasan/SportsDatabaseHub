const ApiError = require('../utils/apiError');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');
const { Tournament, Match } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const result = await Tournament.findAndCountAll({
      limit,
      offset,
      order: [['startDate', 'DESC']]
    });
    res.json(buildPaginatedResult(result, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id, {
      include: [{ association: 'matches' }]
    });
    if (!tournament) throw new ApiError(404, 'Tournament not found');
    res.json(tournament);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const tournament = await Tournament.create(req.body);
    res.status(201).json(tournament);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) throw new ApiError(404, 'Tournament not found');
    await tournament.update(req.body);
    res.json(tournament);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) throw new ApiError(404, 'Tournament not found');
    const matchCount = await Match.count({ where: { tournamentId: tournament.id } });
    if (matchCount > 0) throw new ApiError(409, 'Tournament has matches');
    await tournament.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
