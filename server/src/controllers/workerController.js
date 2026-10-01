const workerService = require('../services/workerService');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../utils/upload');

const list = asyncHandler(async (req, res) => {
  const { search, status, contractorId, from, to, page, limit } = req.query;
  const result = await workerService.list(req.user, { search, status, contractorId, from, to, page, limit });
  res.json(result);
});

const searchWorkers = asyncHandler(async (req, res) => {
  const results = await workerService.search(req.query.q || '', req.query.contractorId, req.user);
  res.json(results);
});

const scanQr = asyncHandler(async (req, res) => {
  const worker = await workerService.findByQrCode(req.params.code, req.user);
  res.json(worker);
});

const getById = asyncHandler(async (req, res) => {
  const worker = await workerService.getById(req.params.id, req.user);
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
  const worker = await workerService.create(data, req.user);
  res.status(201).json(worker);
});

const update = asyncHandler(async (req, res) => {
  const data = attachUploadUrls(req.body, req.files);
  const worker = await workerService.update(req.params.id, data, req.user);
  res.json(worker);
});

const updateStatus = asyncHandler(async (req, res) => {
  const worker = await workerService.updateStatus(req.params.id, req.body.status, req.user);
  res.json(worker);
});

module.exports = { list, searchWorkers, scanQr, getById, create, update, updateStatus };
