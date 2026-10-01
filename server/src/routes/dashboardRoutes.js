const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/counts', requireRole('ADMIN'), dashboardController.getCounts);
router.get('/alerts', requireRole('ADMIN'), dashboardController.getAlerts);
router.get('/supervisor-counts', requireRole('SUPERVISOR'), dashboardController.getSupervisorCounts);
router.get('/contractor-counts', requireRole('CONTRACTOR'), dashboardController.getContractorCounts);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/recent-registrations', requireRole('ADMIN'), dashboardController.getRecentRegistrations);
router.get('/activity', dashboardController.getActivity);

module.exports = router;
