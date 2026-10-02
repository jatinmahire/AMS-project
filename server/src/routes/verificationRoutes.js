const express = require('express');
const verificationController = require('../controllers/verificationController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { verificationSchema } = require('../validators/verificationValidator');
const { makeUploader } = require('../utils/upload');

const router = express.Router();
const upload = makeUploader('verifications');

router.use(authenticate);
// Contractor has no access here — view-only elsewhere in the app, no exception for verification.
router.use(requireRole('ADMIN', 'SUPERVISOR'));

router.get('/:type', verificationController.list);
router.get('/:type/:workerId', verificationController.getOne);
router.put('/:type/:workerId', upload.single('document'), validate(verificationSchema), verificationController.upsert);

module.exports = router;
