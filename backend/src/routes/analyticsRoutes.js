const { Router } = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = Router();

router.get('/goals-per-90', analyticsController.goalsPer90);
router.get('/standings', analyticsController.standings);
router.get('/head-to-head', analyticsController.headToHead);
router.get('/injury-burden', analyticsController.injuryBurden);
router.get('/career-averages', analyticsController.careerAverages);
router.get('/consistency', analyticsController.consistency);
router.get('/player-vs-team', analyticsController.playerVsTeam);
router.get('/player-win-rate', analyticsController.playerWinRate);
router.get('/player-win-rate-by-nationality', analyticsController.winRateByNationality);
router.get('/top-scorers', analyticsController.topScorers);
router.get('/seasonal-trend', analyticsController.seasonalTrend);
router.get('/player-load-vs-active-injuries', analyticsController.playerLoadVsActiveInjuries);
router.get('/player-presence-impact', analyticsController.presenceImpact);

module.exports = router;
