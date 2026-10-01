const express = require('express');
const gateLogController = require('../controllers/gateLogController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { gateLogSchema } = require('../validators/gateLogValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), gateLogController.list);
router.post('/', requireRole('ADMIN', 'SUPERVISOR'), validate(gateLogSchema), gateLogController.create);

module.exports = router;
