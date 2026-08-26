const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { attendanceSchema } = require('../validators/attendanceValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', attendanceController.list);
router.get('/:id', attendanceController.getById);
router.post('/', validate(attendanceSchema), attendanceController.create);
router.put('/:id', validate(attendanceSchema), attendanceController.update);

module.exports = router;
