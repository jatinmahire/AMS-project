const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

const getCounts = asyncHandler(async (req, res) => {
  const counts = await dashboardService.getCounts();
  res.json(counts);
});

module.exports = { getCounts };
