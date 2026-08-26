const express = require('express');
const policyController = require('../controllers/policyController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { policySchema } = require('../validators/policyValidator');
const { makeUploader } = require('../utils/upload');

const router = express.Router();
const upload = makeUploader('policies');

router.use(authenticate);

router.get('/', policyController.list);
router.get('/:id', policyController.getById);
router.post('/', upload.single('file'), validate(policySchema), policyController.create);
router.put('/:id', upload.single('file'), validate(policySchema), policyController.update);
router.delete('/:id', policyController.remove);

module.exports = router;
