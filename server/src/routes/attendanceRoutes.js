const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { attendanceSchema, scanSchema } = require('../validators/attendanceValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), attendanceController.list);
router.get('/:id', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), attendanceController.getById);
router.post('/scan', requireRole('ADMIN', 'SUPERVISOR'), validate(scanSchema), attendanceController.scan);
router.post('/', requireRole('ADMIN', 'SUPERVISOR'), validate(attendanceSchema), attendanceController.create);
router.put('/:id', requireRole('ADMIN', 'SUPERVISOR'), validate(attendanceSchema), attendanceController.update);

module.exports = router;
