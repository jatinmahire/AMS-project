const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/id-card/:workerCode', requireRole('ADMIN', 'CONTRACTOR'), reportController.idCard);
router.post('/id-card/:workerId/generate', requireRole('ADMIN'), reportController.generateIdCard);
router.get('/90-days-history', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), reportController.ninetyDaysHistory);
router.get('/90-days/:workerCode', requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'), reportController.ninetyDays);
router.get('/statutory/:type', requireRole('ADMIN'), reportController.statutoryRegister);
router.get('/muster-roll', requireRole('ADMIN'), reportController.musterRoll);
router.get('/pf-chalan', requireRole('ADMIN'), reportController.pfChalan);

module.exports = router;
