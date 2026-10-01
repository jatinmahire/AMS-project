const gateLogService = require('../services/gateLogService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { date, from, to, workerId, contractorId, page, limit } = req.query;
  const result = await gateLogService.list({ date, from, to, workerId, contractorId, page, limit });
  res.json(result);
});

const create = asyncHandler(async (req, res) => {
  const gateLog = await gateLogService.create(req.body);
  res.status(201).json(gateLog);
});

module.exports = { list, create };
