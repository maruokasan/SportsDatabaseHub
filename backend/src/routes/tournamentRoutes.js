const { Router } = require('express');
const tournamentsController = require('../controllers/tournamentsController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = Router();

router.get('/', tournamentsController.list);
router.get('/:id', tournamentsController.getById);
router.post('/', auth, role('admin'), tournamentsController.create);
router.put('/:id', auth, role('admin'), tournamentsController.update);
router.delete('/:id', auth, role('admin'), tournamentsController.remove);

module.exports = router;
