const { Router } = require('express');
const authRoutes = require('./authRoutes');
const teamRoutes = require('./teamRoutes');
const playerRoutes = require('./playerRoutes');
const tournamentRoutes = require('./tournamentRoutes');
const matchRoutes = require('./matchRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const authMiddleware = require('../middleware/auth');

const router = Router();

router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/matches', matchRoutes);
router.use('/teams', teamRoutes);
router.use('/players', playerRoutes);
router.use('/tournaments', tournamentRoutes);

router.get('/me', authMiddleware, (req, res) => res.json({ user: req.user }));

module.exports = router;
