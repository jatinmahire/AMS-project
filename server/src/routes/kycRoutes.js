const express = require('express');
const kycController = require('../controllers/kycController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/:type/:code', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), kycController.lookup);

module.exports = router;
