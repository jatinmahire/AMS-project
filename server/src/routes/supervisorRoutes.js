const express = require('express');
const supervisorController = require('../controllers/supervisorController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { supervisorSchema } = require('../validators/supervisorValidator');
const { statusUpdateSchema } = require('../validators/statusValidator');
const { makeUploader } = require('../utils/upload');

const router = express.Router();
const upload = makeUploader('supervisors');
const uploadFields = upload.fields([{ name: 'aadhaarFront', maxCount: 1 }, { name: 'aadhaarBack', maxCount: 1 }]);

router.use(authenticate);

router.get('/', supervisorController.list);
router.get('/:id', supervisorController.getById);
router.post('/', uploadFields, validate(supervisorSchema), supervisorController.create);
router.put('/:id', uploadFields, validate(supervisorSchema), supervisorController.update);
router.patch('/:id/status', validate(statusUpdateSchema), supervisorController.updateStatus);

module.exports = router;
