const fineService = require('../services/fineService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { contractorId, from, to, workerId, search, page, limit } = req.query;
  const result = await fineService.list({ contractorId, from, to, workerId, search, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const fine = await fineService.getById(req.params.id);
  res.json(fine);
});

const create = asyncHandler(async (req, res) => {
  const fine = await fineService.create(req.body, req.user.id);
  res.status(201).json(fine);
});

const update = asyncHandler(async (req, res) => {
  const fine = await fineService.update(req.params.id, req.body, req.user.id);
  res.json(fine);
});

const remove = asyncHandler(async (req, res) => {
  await fineService.remove(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
