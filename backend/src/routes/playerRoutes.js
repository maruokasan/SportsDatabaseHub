const { Router } = require('express');
const multer = require('multer');
const playersController = require('../controllers/playersController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', playersController.list);
router.get('/:id', playersController.getById);
router.post('/', auth, role('admin'), playersController.create);
router.put('/:id', auth, role('admin'), playersController.update);
router.delete('/:id', auth, role('admin'), playersController.remove);
router.post('/bulk-delete', auth, role('admin'), playersController.bulkDelete);
router.post('/import', auth, role('admin'), upload.single('file'), playersController.importCsv);

module.exports = router;
