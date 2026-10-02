const express = require('express');
const supervisorController = require('../controllers/supervisorController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { supervisorSchema } = require('../validators/supervisorValidator');
const { statusUpdateSchema } = require('../validators/statusValidator');
const { makeUploader, AADHAAR_RULE } = require('../utils/upload');

const router = express.Router();
// Every file on this form is an Aadhaar scan, so the 700KB cap can sit directly in Multer's limit.
const upload = makeUploader('supervisors', { aadhaarFront: AADHAAR_RULE, aadhaarBack: AADHAAR_RULE }, AADHAAR_RULE.maxSize);
const uploadFields = upload.fields([{ name: 'aadhaarFront', maxCount: 1 }, { name: 'aadhaarBack', maxCount: 1 }]);

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', supervisorController.list);
router.get('/:id', supervisorController.getById);
router.post('/', uploadFields, validate(supervisorSchema), supervisorController.create);
router.put('/:id', uploadFields, validate(supervisorSchema), supervisorController.update);
router.patch('/:id/status', validate(statusUpdateSchema), supervisorController.updateStatus);

module.exports = router;
