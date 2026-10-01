const express = require('express');
const designationController = require('../controllers/designationController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { designationSchema } = require('../validators/designationValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'SUPERVISOR'), designationController.list);
router.get('/:id', requireRole('ADMIN'), designationController.getById);
router.post('/', requireRole('ADMIN'), validate(designationSchema), designationController.create);
router.put('/:id', requireRole('ADMIN'), validate(designationSchema), designationController.update);
router.delete('/:id', requireRole('ADMIN'), designationController.remove);

module.exports = router;
