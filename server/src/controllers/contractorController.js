const contractorService = require('../services/contractorService');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../utils/upload');
const ApiError = require('../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { search, status, page, limit } = req.query;
  const result = await contractorService.list({ search, status, page, limit });
  res.json(result);
});

const dropdown = asyncHandler(async (req, res) => {
  const contractors = await contractorService.listForDropdown();
  res.json(contractors);
});

const getById = asyncHandler(async (req, res) => {
  const contractor = await contractorService.getById(req.params.id);
  res.json(contractor);
});

const create = asyncHandler(async (req, res) => {
  const contractor = await contractorService.create(req.body);
  res.status(201).json(contractor);
});

const update = asyncHandler(async (req, res) => {
  const contractor = await contractorService.update(req.params.id, req.body);
  res.json(contractor);
});

const updateStatus = asyncHandler(async (req, res) => {
  const contractor = await contractorService.updateStatus(req.params.id, req.body.status);
  res.json(contractor);
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A document file is required');
  const { docType } = req.body;
  if (!docType) throw new ApiError(400, 'Document type is required');
  const doc = await contractorService.addDocument(req.params.id, docType, fileUrl('contractors', req.file.filename));
  res.status(201).json(doc);
});

const removeDocument = asyncHandler(async (req, res) => {
  await contractorService.removeDocument(req.params.documentId);
  res.status(204).send();
});

module.exports = { list, dropdown, getById, create, update, updateStatus, uploadDocument, removeDocument };
