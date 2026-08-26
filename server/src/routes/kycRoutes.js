const express = require('express');
const kycController = require('../controllers/kycController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/:type/:code', kycController.lookup);

module.exports = router;
