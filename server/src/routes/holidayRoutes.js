const express = require('express');
const holidayController = require('../controllers/holidayController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { holidaySchema } = require('../validators/holidayValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', holidayController.list);
router.get('/:id', holidayController.getById);
router.post('/', validate(holidaySchema), holidayController.create);
router.put('/:id', validate(holidaySchema), holidayController.update);
router.delete('/:id', holidayController.remove);

module.exports = router;
