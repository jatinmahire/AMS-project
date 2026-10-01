const advanceService = require('../services/advanceService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { contractorId, from, to, workerId, search, page, limit } = req.query;
  const result = await advanceService.list({ contractorId, from, to, workerId, search, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const advance = await advanceService.getById(req.params.id);
  res.json(advance);
});

const create = asyncHandler(async (req, res) => {
  const advance = await advanceService.create(req.body, req.user.id);
  res.status(201).json(advance);
});

const update = asyncHandler(async (req, res) => {
  const advance = await advanceService.update(req.params.id, req.body, req.user.id);
  res.json(advance);
});

const remove = asyncHandler(async (req, res) => {
  await advanceService.remove(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
