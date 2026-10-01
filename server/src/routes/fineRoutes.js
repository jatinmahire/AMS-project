const express = require('express');
const fineController = require('../controllers/fineController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { fineSchema } = require('../validators/fineValidator');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', fineController.list);
router.get('/:id', fineController.getById);
router.post('/', validate(fineSchema), fineController.create);
router.put('/:id', validate(fineSchema), fineController.update);
router.delete('/:id', fineController.remove);

module.exports = router;
