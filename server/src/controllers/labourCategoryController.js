const labourCategoryService = require('../services/labourCategoryService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const categories = await labourCategoryService.list();
  res.json(categories);
});

const getById = asyncHandler(async (req, res) => {
  const category = await labourCategoryService.getById(req.params.id);
  res.json(category);
});

const create = asyncHandler(async (req, res) => {
  const category = await labourCategoryService.create(req.body);
  res.status(201).json(category);
});

const update = asyncHandler(async (req, res) => {
  const category = await labourCategoryService.update(req.params.id, req.body);
  res.json(category);
});

const remove = asyncHandler(async (req, res) => {
  await labourCategoryService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
