const express = require('express');
const overtimeController = require('../controllers/overtimeController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { overtimeSchema } = require('../validators/overtimeValidator');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', overtimeController.list);
router.get('/:id', overtimeController.getById);
router.post('/', validate(overtimeSchema), overtimeController.create);
router.put('/:id', validate(overtimeSchema), overtimeController.update);
router.delete('/:id', overtimeController.remove);

module.exports = router;
