const express = require('express');
const labourCategoryController = require('../controllers/labourCategoryController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { labourCategorySchema } = require('../validators/labourCategoryValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', labourCategoryController.list);
router.get('/:id', labourCategoryController.getById);
router.post('/', validate(labourCategorySchema), labourCategoryController.create);
router.put('/:id', validate(labourCategorySchema), labourCategoryController.update);
router.delete('/:id', labourCategoryController.remove);

module.exports = router;
