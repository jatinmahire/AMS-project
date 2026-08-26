const express = require('express');
const workerController = require('../controllers/workerController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { workerSchema } = require('../validators/workerValidator');
const { statusUpdateSchema } = require('../validators/statusValidator');
const { makeUploader } = require('../utils/upload');

const router = express.Router();
const upload = makeUploader('workers');
const uploadFields = upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'bankPassbook', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]);

router.use(authenticate);

router.get('/', workerController.list);
router.get('/search', workerController.searchWorkers);
router.get('/:id', workerController.getById);
router.post('/', uploadFields, validate(workerSchema), workerController.create);
router.put('/:id', uploadFields, validate(workerSchema), workerController.update);
router.patch('/:id/status', validate(statusUpdateSchema), workerController.updateStatus);

module.exports = router;
