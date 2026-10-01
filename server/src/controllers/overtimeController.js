const overtimeService = require('../services/overtimeService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { contractorId, from, to, workerId, search, page, limit } = req.query;
  const result = await overtimeService.list({ contractorId, from, to, workerId, search, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.getById(req.params.id);
  res.json(overtime);
});

const create = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.create(req.body, req.user.id);
  res.status(201).json(overtime);
});

const update = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.update(req.params.id, req.body, req.user.id);
  res.json(overtime);
});

const remove = asyncHandler(async (req, res) => {
  await overtimeService.remove(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
