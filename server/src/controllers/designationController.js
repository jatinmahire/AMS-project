const designationService = require('../services/designationService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const designations = await designationService.list();
  res.json(designations);
});

const getById = asyncHandler(async (req, res) => {
  const designation = await designationService.getById(req.params.id);
  res.json(designation);
});

const create = asyncHandler(async (req, res) => {
  const designation = await designationService.create(req.body);
  res.status(201).json(designation);
});

const update = asyncHandler(async (req, res) => {
  const designation = await designationService.update(req.params.id, req.body);
  res.json(designation);
});

const remove = asyncHandler(async (req, res) => {
  await designationService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
