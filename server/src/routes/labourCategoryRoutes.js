const express = require('express');
const labourCategoryController = require('../controllers/labourCategoryController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { labourCategorySchema } = require('../validators/labourCategoryValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), labourCategoryController.list);
router.get('/:id', requireRole('ADMIN'), labourCategoryController.getById);
router.post('/', requireRole('ADMIN'), validate(labourCategorySchema), labourCategoryController.create);
router.put('/:id', requireRole('ADMIN'), validate(labourCategorySchema), labourCategoryController.update);
router.delete('/:id', requireRole('ADMIN'), labourCategoryController.remove);

module.exports = router;
