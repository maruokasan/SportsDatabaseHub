const ApiError = require("../utils/apiError");
const analyticsService = require("../services/analyticsService");
const cacheService = require("../services/cacheService");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

exports.goalsPer90 = async (_req, res, next) => {
  try {
    const cacheKey = cacheService.generateKey("analytics:goalsPer90");

    // Try to get from cache first
    let data = await cacheService.get(cacheKey);
    if (!data) {
      // Cache miss - fetch from service
      data = await analyticsService.goalsPer90();
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.standings = async (_req, res, next) => {
  try {
    const cacheKey = cacheService.generateKey("analytics:standings");

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.standings();
      // Cache for 15 minutes (medium volatility)
      await cacheService.set(cacheKey, data, 900);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.headToHead = async (req, res, next) => {
  try {
    const { teamA, teamB } = req.query;
    if (!teamA || !teamB)
      throw new ApiError(400, "teamA and teamB query params required");

    const cacheKey = cacheService.generateKey("analytics:headToHead", {
      teamA,
      teamB,
    });

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.headToHead(teamA, teamB);
      // Cache for 15 minutes (medium volatility)
      await cacheService.set(cacheKey, data, 900);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.injuryBurden = async (_req, res, next) => {
  try {
    const cacheKey = cacheService.generateKey("analytics:injuryBurden");

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.injuryBurden();
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.careerAverages = async (req, res, next) => {
  try {
    const { playerId } = req.query;
    const cacheKey = cacheService.generateKey("analytics:careerAverages", {
      playerId,
    });

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.careerAverages(playerId);
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.consistency = async (req, res, next) => {
  try {
    const { playerId } = req.query;
    const cacheKey = cacheService.generateKey("analytics:consistency", {
      playerId,
    });

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.consistency(playerId);
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.playerVsTeam = async (req, res, next) => {
  try {
    const { playerId, teamId } = req.query;
    if (!playerId || !teamId)
      throw new ApiError(400, "playerId and teamId query params required");

    const cacheKey = cacheService.generateKey("analytics:playerVsTeam", {
      playerId,
      teamId,
    });

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.playerVsTeam(playerId, teamId);
      if (!data) throw new ApiError(404, "Player or team not found");
      // Cache for 15 minutes (medium volatility)
      await cacheService.set(cacheKey, data, 900);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.topScorers = async (req, res, next) => {
  try {
    const { tournamentId, limit } = req.query;
    if (!tournamentId)
      throw new ApiError(400, "tournamentId query param required");

    const cacheKey = cacheService.generateKey("analytics:topScorers", {
      tournamentId,
      limit,
    });

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.topScorersByTournament(tournamentId, limit);
      // Cache for 15 minutes (medium volatility)
      await cacheService.set(cacheKey, data, 900);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.playerWinRate = async (_req, res, next) => {
  try {
    const cacheKey = cacheService.generateKey("analytics:playerWinRate");

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.playerWinRate();
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.winRateByNationality = async (_req, res, next) => {
  try {
    const cacheKey = cacheService.generateKey("analytics:winRateByNationality");

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.winRateByNationality();
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.seasonalTrend = async (req, res, next) => {
  try {
    const { bucket } = req.query;
    const cacheKey = cacheService.generateKey("analytics:seasonalTrend", {
      bucket,
    });

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.seasonalTrend(bucket);
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.playerLoadVsActiveInjuries = async (_req, res, next) => {
  try {
    const cacheKey = cacheService.generateKey(
      "analytics:playerLoadVsActiveInjuries"
    );

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.playerLoadVsActiveInjuries();
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.nationalityPerformance = async (_req, res, next) => {
  try {
    const cacheKey = cacheService.generateKey(
      "analytics:nationalityPerformance"
    );

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.nationalityPerformance();
      // Cache for 1 hour (low volatility)
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.presenceImpact = async (req, res, next) => {
  try {
    const { playerId, teamId, opponentTeamId } = req.query;
    const matchupTeamId = opponentTeamId || teamId;
    if (!playerId || !matchupTeamId)
      throw new ApiError(
        400,
        "playerId and opponentTeamId query params required"
      );

    const cacheKey = cacheService.generateKey("analytics:presenceImpact", {
      playerId,
      matchupTeamId,
    });

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.presenceImpact(playerId, matchupTeamId);
      // Cache for 15 minutes (medium volatility)
      await cacheService.set(cacheKey, data, 900);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.ageGroupPerformance = async (req, res, next) => {
  try {
    const { season, tournamentId } = req.query;

    // Validate parameters
    if (season && (isNaN(season) || season < 2000 || season > 2100)) {
      throw new ApiError(400, "season must be a valid year");
    }
    if (
      tournamentId &&
      !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        tournamentId
      )
    ) {
      throw new ApiError(400, "tournamentId must be a valid UUID");
    }

    const cacheKey = cacheService.generateKey("analytics:ageGroupPerformance", {
      season,
      tournamentId,
    });

    let data = await cacheService.get(cacheKey);
    if (!data) {
      data = await analyticsService.getAgeGroupPerformance(
        season,
        tournamentId
      );
      // Cache for 5 minutes (short volatility)
      await cacheService.set(cacheKey, data, 300);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * Cache invalidation functions for analytics data
 * These should be called when underlying data changes
 */

// Invalidate all analytics cache
exports.invalidateAllAnalytics = async () => {
  try {
    await cacheService.delByPattern("analytics:*");
    console.log("All analytics cache invalidated");
  } catch (error) {
    console.error("Failed to invalidate analytics cache:", error.message);
  }
};

// Invalidate player-specific analytics
exports.invalidatePlayerAnalytics = async (playerId) => {
  try {
    const patterns = [
      `analytics:playerId:${playerId}*`,
      "analytics:goalsPer90*",
      "analytics:careerAverages*",
      "analytics:consistency*",
      "analytics:playerWinRate*",
      "analytics:winRateByNationality*",
      "analytics:presenceImpact*",
    ];

    for (const pattern of patterns) {
      await cacheService.delByPattern(pattern);
    }
    console.log(`Player analytics cache invalidated for player ${playerId}`);
  } catch (error) {
    console.error(
      "Failed to invalidate player analytics cache:",
      error.message
    );
  }
};

// Invalidate team-specific analytics
exports.invalidateTeamAnalytics = async (teamId) => {
  try {
    const patterns = [
      `analytics:teamId:${teamId}*`,
      "analytics:standings*",
      "analytics:headToHead*",
      "analytics:playerVsTeam*",
      "analytics:topScorers*",
      "analytics:presenceImpact*",
    ];

    for (const pattern of patterns) {
      await cacheService.delByPattern(pattern);
    }
    console.log(`Team analytics cache invalidated for team ${teamId}`);
  } catch (error) {
    console.error("Failed to invalidate team analytics cache:", error.message);
  }
};

// Invalidate match-related analytics
exports.invalidateMatchAnalytics = async () => {
  try {
    const patterns = [
      "analytics:standings*",
      "analytics:goalsPer90*",
      "analytics:headToHead*",
      "analytics:playerVsTeam*",
      "analytics:topScorers*",
      "analytics:seasonalTrend*",
      "analytics:playerWinRate*",
      "analytics:winRateByNationality*",
      "analytics:presenceImpact*",
    ];

    for (const pattern of patterns) {
      await cacheService.delByPattern(pattern);
    }
    console.log("Match analytics cache invalidated");
  } catch (error) {
    console.error("Failed to invalidate match analytics cache:", error.message);
  }
};

// Invalidate injury-related analytics
exports.invalidateInjuryAnalytics = async () => {
  try {
    const patterns = [
      "analytics:injuryBurden*",
      "analytics:playerLoadVsActiveInjuries*",
    ];

    for (const pattern of patterns) {
      await cacheService.delByPattern(pattern);
    }
    console.log("Injury analytics cache invalidated");
  } catch (error) {
    console.error(
      "Failed to invalidate injury analytics cache:",
      error.message
    );
  }
};
