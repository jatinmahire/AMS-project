const express = require('express');
const advanceController = require('../controllers/advanceController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { advanceSchema } = require('../validators/advanceValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', advanceController.list);
router.get('/:id', advanceController.getById);
router.post('/', validate(advanceSchema), advanceController.create);
router.put('/:id', validate(advanceSchema), advanceController.update);
router.delete('/:id', advanceController.remove);

module.exports = router;
