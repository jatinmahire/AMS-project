const holidayService = require('../services/holidayService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { contractorId, page, limit } = req.query;
  const result = await holidayService.list({ contractorId, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const holiday = await holidayService.getById(req.params.id);
  res.json(holiday);
});

const create = asyncHandler(async (req, res) => {
  const holiday = await holidayService.create(req.body);
  res.status(201).json(holiday);
});

const update = asyncHandler(async (req, res) => {
  const holiday = await holidayService.update(req.params.id, req.body);
  res.json(holiday);
});

const remove = asyncHandler(async (req, res) => {
  await holidayService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
