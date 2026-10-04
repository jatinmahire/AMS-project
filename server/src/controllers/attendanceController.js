const attendanceService = require('../services/attendanceService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { date, workerId, contractorId, page, limit } = req.query;
  const result = await attendanceService.list(req.user, { date, workerId, contractorId, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.getById(req.params.id, req.user);
  res.json(attendance);
});

const create = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.create(req.body, req.user.id, req.user);
  res.status(201).json(attendance);
});

const update = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.update(req.params.id, req.body, req.user.id, req.user);
  res.json(attendance);
});

const scan = asyncHandler(async (req, res) => {
  const result = await attendanceService.scan(req.body.code, req.user.id, req.user);
  res.json(result);
});

module.exports = { list, getById, create, update, scan };
