const kycService = require('../services/kycService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const lookup = asyncHandler(async (req, res) => {
  const { type, code } = req.params;

  if ((req.user.role === 'SUPERVISOR' || req.user.role === 'CONTRACTOR') && type !== 'worker') {
    throw new ApiError(403, 'You do not have permission to do this');
  }

  if (type === 'worker') return res.json(await kycService.lookupWorker(code, req.user));
  if (type === 'contractor') return res.json(await kycService.lookupContractor(code));
  if (type === 'supervisor') return res.json(await kycService.lookupSupervisor(code));

  throw new ApiError(400, 'Unknown lookup type');
});

module.exports = { lookup };
