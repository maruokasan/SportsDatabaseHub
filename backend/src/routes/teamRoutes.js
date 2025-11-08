const { Router } = require('express');
const teamsController = require('../controllers/teamsController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = Router();

router.get('/', teamsController.list);
router.get('/:id', teamsController.getById);
router.post('/', auth, role('admin'), teamsController.create);
router.put('/:id', auth, role('admin'), teamsController.update);
router.delete('/:id', auth, role('admin'), teamsController.remove);

module.exports = router;
