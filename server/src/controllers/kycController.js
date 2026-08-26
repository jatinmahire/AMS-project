const kycService = require('../services/kycService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const lookup = asyncHandler(async (req, res) => {
  const { type, code } = req.params;

  if (type === 'worker') return res.json(await kycService.lookupWorker(code));
  if (type === 'contractor') return res.json(await kycService.lookupContractor(code));
  if (type === 'supervisor') return res.json(await kycService.lookupSupervisor(code));

  throw new ApiError(400, 'Unknown lookup type');
});

module.exports = { lookup };
