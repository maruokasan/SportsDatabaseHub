const { Router } = require("express");
const analyticsController = require("../controllers/analyticsController");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

const router = Router();

router.get("/goals-per-90", cacheMiddleware(), analyticsController.goalsPer90);
router.get("/standings", cacheMiddleware(), analyticsController.standings);
router.get("/head-to-head", cacheMiddleware(), analyticsController.headToHead);
router.get(
  "/injury-burden",
  cacheMiddleware(),
  analyticsController.injuryBurden
);
router.get(
  "/career-averages",
  cacheMiddleware(),
  analyticsController.careerAverages
);
router.get("/consistency", cacheMiddleware(), analyticsController.consistency);
router.get(
  "/player-vs-team",
  cacheMiddleware(),
  analyticsController.playerVsTeam
);
router.get(
  "/player-win-rate",
  cacheMiddleware(),
  analyticsController.playerWinRate
);
router.get(
  "/player-win-rate-by-nationality",
  cacheMiddleware(),
  analyticsController.winRateByNationality
);
router.get("/top-scorers", cacheMiddleware(), analyticsController.topScorers);
router.get(
  "/seasonal-trend",
  cacheMiddleware(),
  analyticsController.seasonalTrend
);
router.get(
  "/player-load-vs-active-injuries",
  cacheMiddleware(),
  analyticsController.playerLoadVsActiveInjuries
);
router.get(
  "/nationality-performance",
  cacheMiddleware(),
  analyticsController.nationalityPerformance
);
router.get(
  "/player-presence-impact",
  cacheMiddleware(),
  analyticsController.presenceImpact
);

module.exports = router;
