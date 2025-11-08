const { Op } = require('sequelize');
const { parseString } = require('fast-csv');
const ApiError = require('../utils/apiError');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');
const { Player, Team, PlayerMatchStats } = require('../models');

const allowedSortFields = new Set(['firstName', 'lastName', 'position', 'nationality', 'jerseyNumber']);

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const sortBy = allowedSortFields.has(req.query.sortBy) ? req.query.sortBy : 'lastName';
    const sortDir = req.query.sortDir === 'desc' ? 'DESC' : 'ASC';
    const search = (req.query.search || '').trim();
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { nationality: { [Op.like]: `%${search}%` } }
      ];
    }
    if (req.query.teamId) {
      where.teamId = req.query.teamId;
    }
    if (req.query.position) {
      where.position = req.query.position;
    }

    const result = await Player.findAndCountAll({
      where,
      include: [{ model: Team, as: 'team', attributes: ['id', 'name'] }],
      order: [[sortBy, sortDir]],
      limit,
      offset
    });

    res.json(buildPaginatedResult(result, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id, {
      include: [
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { association: 'familyContacts' },
        { association: 'injuries' }
      ]
    });
    if (!player) throw new ApiError(404, 'Player not found');
    res.json(player);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) throw new ApiError(404, 'Player not found');
    await player.update(req.body);
    res.json(player);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) throw new ApiError(404, 'Player not found');
    const statCount = await PlayerMatchStats.count({ where: { playerId: player.id } });
    if (statCount > 0) throw new ApiError(409, 'Player has match stats');
    await player.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.bulkDelete = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) throw new ApiError(400, 'ids payload required');

    const results = [];
    for (const id of ids) {
      const player = await Player.findByPk(id);
      if (!player) {
        results.push({ id, status: 'not_found' });
        continue;
      }
      const statCount = await PlayerMatchStats.count({ where: { playerId: id } });
      if (statCount > 0) {
        results.push({ id, status: 'blocked', reason: 'Player has match stats' });
        continue;
      }
      await player.destroy();
      results.push({ id, status: 'deleted' });
    }

    res.json({ results });
  } catch (err) {
    next(err);
  }
};

const parseCsvBuffer = (buffer) => new Promise((resolve, reject) => {
  const rows = [];
  parseString(buffer.toString('utf-8'), { headers: true, ignoreEmpty: true })
    .on('error', reject)
    .on('data', (row) => rows.push(row))
    .on('end', () => resolve(rows));
});

exports.importCsv = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'CSV file required');
    const rows = await parseCsvBuffer(req.file.buffer);

    const results = [];
    for (const row of rows) {
      try {
        const payload = {
          firstName: row.first_name,
          lastName: row.last_name,
          position: row.position,
          nationality: row.nationality,
          birthdate: row.birthdate,
          jerseyNumber: Number(row.jersey_number),
          teamId: row.team_id || null
        };
        await Player.create(payload);
        results.push({ row: payload, status: 'inserted' });
      } catch (err) {
        results.push({ row, status: 'error', message: err.message });
      }
    }

    res.json({ count: results.length, results });
  } catch (err) {
    next(err);
  }
};
