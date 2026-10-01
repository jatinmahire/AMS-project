const policyService = require('../services/policyService');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../utils/upload');
const ApiError = require('../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { contractorId, page, limit } = req.query;
  const result = await policyService.list(req.user, { contractorId, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const policy = await policyService.getById(req.params.id, req.user);
  res.json(policy);
});

const create = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Policy file is required');
  const data = { ...req.body, fileUrl: fileUrl('policies', req.file.filename) };
  const policy = await policyService.create(data);
  res.status(201).json(policy);
});

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.fileUrl = fileUrl('policies', req.file.filename);
  const policy = await policyService.update(req.params.id, data);
  res.json(policy);
});

const remove = asyncHandler(async (req, res) => {
  await policyService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
