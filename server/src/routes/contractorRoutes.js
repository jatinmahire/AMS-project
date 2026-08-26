const express = require('express');
const contractorController = require('../controllers/contractorController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { contractorSchema } = require('../validators/contractorValidator');
const { statusUpdateSchema } = require('../validators/statusValidator');
const { makeUploader } = require('../utils/upload');

const router = express.Router();
const upload = makeUploader('contractors');

router.use(authenticate);

router.get('/', contractorController.list);
router.get('/dropdown', contractorController.dropdown);
router.get('/:id', contractorController.getById);
router.post('/', validate(contractorSchema), contractorController.create);
router.put('/:id', validate(contractorSchema), contractorController.update);
router.patch('/:id/status', validate(statusUpdateSchema), contractorController.updateStatus);
router.post('/:id/documents', upload.single('file'), contractorController.uploadDocument);
router.delete('/documents/:documentId', contractorController.removeDocument);

module.exports = router;
