const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const idCard = asyncHandler(async (req, res) => {
  const result = await reportService.getIdCard(req.params.workerCode);
  res.json(result);
});

const generateIdCard = asyncHandler(async (req, res) => {
  const validityMonths = Number(req.body.validityMonths);
  if (!validityMonths || validityMonths <= 0) {
    throw new ApiError(400, 'Validity in months is required');
  }
  const idCardRecord = await reportService.generateIdCard(req.params.workerId, validityMonths);
  res.status(201).json(idCardRecord);
});

const ninetyDays = asyncHandler(async (req, res) => {
  const result = await reportService.calculateCompliance(req.params.workerCode);
  res.json(result);
});

const statutoryRegister = asyncHandler(async (req, res) => {
  const { contractorId, month } = req.query;
  const rows = await reportService.statutoryRegister(req.params.type, { contractorId, month });
  res.json(rows);
});

module.exports = { idCard, generateIdCard, ninetyDays, statutoryRegister };
