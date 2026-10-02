const express = require('express');
const geoService = require('../services/geoService');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/states', asyncHandler(async (req, res) => {
  res.json(await geoService.listStates());
}));

router.get('/cities', asyncHandler(async (req, res) => {
  res.json(await geoService.listCities(req.query.state));
}));

module.exports = router;
