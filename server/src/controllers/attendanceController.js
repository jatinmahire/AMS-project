const attendanceService = require('../services/attendanceService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { date, workerId, contractorId, page, limit } = req.query;
  const result = await attendanceService.list({ date, workerId, contractorId, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.getById(req.params.id);
  res.json(attendance);
});

const create = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.create(req.body, req.user.id);
  res.status(201).json(attendance);
});

const update = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.update(req.params.id, req.body, req.user.id);
  res.json(attendance);
});

module.exports = { list, getById, create, update };
