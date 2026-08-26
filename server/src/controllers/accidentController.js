const accidentService = require('../services/accidentService');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../utils/upload');

const list = asyncHandler(async (req, res) => {
  const { contractorId, month, workerId, page, limit } = req.query;
  const result = await accidentService.list({ contractorId, month, workerId, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const accident = await accidentService.getById(req.params.id);
  res.json(accident);
});

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.photoUrl = fileUrl('accidents', req.file.filename);
  const accident = await accidentService.create(data);
  res.status(201).json(accident);
});

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.photoUrl = fileUrl('accidents', req.file.filename);
  const accident = await accidentService.update(req.params.id, data, req.user.id);
  res.json(accident);
});

const remove = asyncHandler(async (req, res) => {
  await accidentService.remove(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
