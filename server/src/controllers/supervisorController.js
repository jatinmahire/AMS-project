const supervisorService = require('../services/supervisorService');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../utils/upload');

const list = asyncHandler(async (req, res) => {
  const { search, status, page, limit } = req.query;
  const result = await supervisorService.list({ search, status, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const supervisor = await supervisorService.getById(req.params.id);
  res.json(supervisor);
});

function attachUploadUrls(body, files) {
  const data = { ...body };
  if (files?.aadhaarFront?.[0]) {
    data.aadhaarFrontUrl = fileUrl('supervisors', files.aadhaarFront[0].filename);
  }
  if (files?.aadhaarBack?.[0]) {
    data.aadhaarBackUrl = fileUrl('supervisors', files.aadhaarBack[0].filename);
  }
  return data;
}

const create = asyncHandler(async (req, res) => {
  const data = attachUploadUrls(req.body, req.files);
  const supervisor = await supervisorService.create(data);
  res.status(201).json(supervisor);
});

const update = asyncHandler(async (req, res) => {
  const data = attachUploadUrls(req.body, req.files);
  const supervisor = await supervisorService.update(req.params.id, data);
  res.json(supervisor);
});

const updateStatus = asyncHandler(async (req, res) => {
  const supervisor = await supervisorService.updateStatus(req.params.id, req.body.status);
  res.json(supervisor);
});

module.exports = { list, getById, create, update, updateStatus };
