const express = require('express');
const damageController = require('../controllers/damageController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { damageSchema } = require('../validators/damageValidator');
const { makeUploader } = require('../utils/upload');

const router = express.Router();
const upload = makeUploader('damages');

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', damageController.list);
router.get('/:id', damageController.getById);
router.post('/', upload.single('image'), validate(damageSchema), damageController.create);
router.put('/:id', upload.single('image'), validate(damageSchema), damageController.update);
router.delete('/:id', damageController.remove);

module.exports = router;
