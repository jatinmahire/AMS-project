const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/id-card/:workerCode', reportController.idCard);
router.post('/id-card/:workerId/generate', reportController.generateIdCard);
router.get('/90-days/:workerCode', reportController.ninetyDays);
router.get('/statutory/:type', reportController.statutoryRegister);

module.exports = router;
