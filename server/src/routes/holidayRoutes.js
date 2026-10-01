const express = require('express');
const holidayController = require('../controllers/holidayController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { holidaySchema } = require('../validators/holidayValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), holidayController.list);
router.get('/:id', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), holidayController.getById);
router.post('/', requireRole('ADMIN'), validate(holidaySchema), holidayController.create);
router.put('/:id', requireRole('ADMIN'), validate(holidaySchema), holidayController.update);
router.delete('/:id', requireRole('ADMIN'), holidayController.remove);

module.exports = router;
