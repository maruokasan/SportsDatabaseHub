const { Op } = require('sequelize');
const { Team, Player, Match } = require('../models');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');
const ApiError = require('../utils/apiError');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = (req.query.search || '').trim();

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } }
      ];
    }

    const result = await Team.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.json(buildPaginatedResult(result, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: Player, as: 'players' }]
    });
    if (!team) throw new ApiError(404, 'Team not found');
    res.json(team);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, city, country, logoUrl } = req.body;
    const team = await Team.create({ name, city, country, logoUrl });
    res.status(201).json(team);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) throw new ApiError(404, 'Team not found');
    await team.update(req.body);
    res.json(team);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) throw new ApiError(404, 'Team not found');

    const [playerCount, matchCount] = await Promise.all([
      Player.count({ where: { teamId: team.id } }),
      Match.count({
        where: {
          [Op.or]: [{ homeTeamId: team.id }, { awayTeamId: team.id }]
        }
      })
    ]);
    if (playerCount > 0 || matchCount > 0) {
      throw new ApiError(409, 'Team has dependent records');
    }

    await team.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
