const express = require('express');
const designationController = require('../controllers/designationController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { designationSchema } = require('../validators/designationValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', designationController.list);
router.get('/:id', designationController.getById);
router.post('/', validate(designationSchema), designationController.create);
router.put('/:id', validate(designationSchema), designationController.update);
router.delete('/:id', designationController.remove);

module.exports = router;
