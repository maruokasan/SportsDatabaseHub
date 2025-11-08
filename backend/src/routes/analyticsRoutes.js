const { Router } = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = Router();

router.get('/goals-per-90', analyticsController.goalsPer90);
router.get('/standings', analyticsController.standings);
router.get('/head-to-head', analyticsController.headToHead);
router.get('/injury-burden', analyticsController.injuryBurden);
router.get('/career-averages', analyticsController.careerAverages);
router.get('/consistency', analyticsController.consistency);

module.exports = router;
