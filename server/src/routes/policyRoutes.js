const express = require('express');
const policyController = require('../controllers/policyController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { policySchema } = require('../validators/policyValidator');
const { makeUploader } = require('../utils/upload');

const router = express.Router();
const upload = makeUploader('policies');

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), policyController.list);
router.get('/:id', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), policyController.getById);
router.post('/', requireRole('ADMIN'), upload.single('file'), validate(policySchema), policyController.create);
router.put('/:id', requireRole('ADMIN'), upload.single('file'), validate(policySchema), policyController.update);
router.delete('/:id', requireRole('ADMIN'), policyController.remove);

module.exports = router;
