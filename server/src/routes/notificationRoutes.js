const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'SUPERVISOR', 'CONTRACTOR'));

router.get('/', notificationController.list);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
