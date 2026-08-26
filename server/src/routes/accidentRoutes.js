const express = require('express');
const accidentController = require('../controllers/accidentController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { accidentSchema } = require('../validators/accidentValidator');
const { makeUploader } = require('../utils/upload');

const router = express.Router();
const upload = makeUploader('accidents');

router.use(authenticate);

router.get('/', accidentController.list);
router.get('/:id', accidentController.getById);
router.post('/', upload.single('photo'), validate(accidentSchema), accidentController.create);
router.put('/:id', upload.single('photo'), validate(accidentSchema), accidentController.update);
router.delete('/:id', accidentController.remove);

module.exports = router;
