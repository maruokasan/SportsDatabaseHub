const { Router } = require('express');
const matchesController = require('../controllers/matchesController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = Router();

router.get('/', matchesController.list);
router.get('/:id', matchesController.getById);
router.post('/', auth, role('admin'), matchesController.create);
router.put('/:id', auth, role('admin'), matchesController.update);
router.delete('/:id', auth, role('admin'), matchesController.remove);
router.post('/:id/complete', auth, role('admin'), matchesController.complete);

module.exports = router;
