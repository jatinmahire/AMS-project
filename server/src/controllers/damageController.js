const damageService = require('../services/damageService');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../utils/upload');

const list = asyncHandler(async (req, res) => {
  const { contractorId, from, to, workerId, search, page, limit } = req.query;
  const result = await damageService.list({ contractorId, from, to, workerId, search, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const damage = await damageService.getById(req.params.id);
  res.json(damage);
});

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.imageUrl = fileUrl('damages', req.file.filename);
  const damage = await damageService.create(data, req.user.id);
  res.status(201).json(damage);
});

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.imageUrl = fileUrl('damages', req.file.filename);
  const damage = await damageService.update(req.params.id, data, req.user.id);
  res.json(damage);
});

const remove = asyncHandler(async (req, res) => {
  await damageService.remove(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
