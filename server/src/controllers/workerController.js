const workerService = require('../services/workerService');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../utils/upload');

const list = asyncHandler(async (req, res) => {
  const { search, status, contractorId, page, limit } = req.query;
  const result = await workerService.list({ search, status, contractorId, page, limit });
  res.json(result);
});

const searchWorkers = asyncHandler(async (req, res) => {
  const results = await workerService.search(req.query.q || '');
  res.json(results);
});

const getById = asyncHandler(async (req, res) => {
  const worker = await workerService.getById(req.params.id);
  res.json(worker);
});

function attachUploadUrls(body, files) {
  const data = { ...body };
  const map = { idFront: 'idFrontUrl', idBack: 'idBackUrl', bankPassbook: 'bankPassbookUrl', photo: 'photoUrl' };
  for (const [field, urlKey] of Object.entries(map)) {
    if (files?.[field]?.[0]) {
      data[urlKey] = fileUrl('workers', files[field][0].filename);
    }
  }
  return data;
}

const create = asyncHandler(async (req, res) => {
  const data = attachUploadUrls(req.body, req.files);
  const worker = await workerService.create(data);
  res.status(201).json(worker);
});

const update = asyncHandler(async (req, res) => {
  const data = attachUploadUrls(req.body, req.files);
  const worker = await workerService.update(req.params.id, data);
  res.json(worker);
});

const updateStatus = asyncHandler(async (req, res) => {
  const worker = await workerService.updateStatus(req.params.id, req.body.status);
  res.json(worker);
});

module.exports = { list, searchWorkers, getById, create, update, updateStatus };
