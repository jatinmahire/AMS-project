const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/counts', dashboardController.getCounts);

module.exports = router;
