const express = require('express');
const workerController = require('../controllers/workerController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { workerSchema } = require('../validators/workerValidator');
const { statusUpdateSchema } = require('../validators/statusValidator');
const { makeUploader, enforceFieldSizes, AADHAAR_RULE } = require('../utils/upload');

const router = express.Router();
const FILE_RULES = { idFront: AADHAAR_RULE, idBack: AADHAAR_RULE };
const upload = makeUploader('workers', FILE_RULES);
const uploadFields = [
  upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'bankPassbook', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
  ]),
  enforceFieldSizes(FILE_RULES),
];

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'CONTRACTOR'), workerController.list);
router.get('/search', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), workerController.searchWorkers);
router.get('/scan/:code', requireRole('ADMIN', 'SUPERVISOR'), workerController.scanQr);
router.get('/:id', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), workerController.getById);
router.post('/', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), uploadFields, validate(workerSchema), workerController.create);
router.put('/:id', requireRole('ADMIN'), uploadFields, validate(workerSchema), workerController.update);
router.patch('/:id/status', requireRole('ADMIN'), validate(statusUpdateSchema), workerController.updateStatus);

module.exports = router;
