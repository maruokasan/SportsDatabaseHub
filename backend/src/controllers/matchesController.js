const { Op } = require("sequelize");
const ApiError = require("../utils/apiError");
const {
  parsePagination,
  buildPaginatedResult,
} = require("../utils/pagination");
const {
  Match,
  Team,
  Tournament,
  PlayerMatchStats,
  Player,
} = require("../models");
const matchService = require("../services/matchService");
const { invalidateMatchAnalytics } = require("./analyticsController");

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.tournamentId) where.tournamentId = req.query.tournamentId;
    if (req.query.teamId) {
      where[Op.or] = [
        { homeTeamId: req.query.teamId },
        { awayTeamId: req.query.teamId },
      ];
    }

    const result = await Match.findAndCountAll({
      where,
      include: [
        { model: Team, as: "homeTeam", attributes: ["id", "name"] },
        { model: Team, as: "awayTeam", attributes: ["id", "name"] },
        { model: Tournament, as: "tournament", attributes: ["id", "name"] },
      ],
      order: [["matchDate", "DESC"]],
      limit,
      offset,
    });

    res.json(buildPaginatedResult(result, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id, {
      include: [
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        { model: Tournament, as: "tournament" },
        {
          model: PlayerMatchStats,
          as: "playerStats",
          include: [
            {
              model: Player,
              as: "player",
              attributes: ["id", "firstName", "lastName", "teamId"],
            },
          ],
        },
      ],
    });
    if (!match) throw new ApiError(404, "Match not found");
    res.json(match);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) throw new ApiError(404, "Match not found");
    await match.update(req.body);

    // Invalidate analytics cache when match data changes
    await invalidateMatchAnalytics();

    res.json(match);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) throw new ApiError(404, "Match not found");
    if (match.status === "completed")
      throw new ApiError(409, "Cannot delete completed match");
    await match.destroy();

    // Invalidate analytics cache when match is deleted
    await invalidateMatchAnalytics();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.complete = async (req, res, next) => {
  try {
    const match = await matchService.completeMatch(req.params.id, req.body, {
      userId: req.user?.sub,
    });
    const hydrated = await Match.findByPk(match.id, {
      include: [
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        {
          model: PlayerMatchStats,
          as: "playerStats",
          include: [{ model: Player, as: "player" }],
        },
      ],
    });

    // Invalidate analytics cache when match is completed (major data change)
    await invalidateMatchAnalytics();

    res.json(hydrated);
  } catch (err) {
    next(err);
  }
};
