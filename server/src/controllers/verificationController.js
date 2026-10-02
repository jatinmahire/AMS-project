const verificationService = require('../services/verificationService');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../utils/upload');

function normalizedType(req) {
  return String(req.params.type).toUpperCase();
}

const list = asyncHandler(async (req, res) => {
  const { status, contractorId, search, page, limit } = req.query;
  res.json(await verificationService.listByType(normalizedType(req), req.user, { status, contractorId, search, page, limit }));
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await verificationService.getForEdit(normalizedType(req), req.params.workerId, req.user));
});

const upsert = asyncHandler(async (req, res) => {
  const documentUrl = req.file ? fileUrl('verifications', req.file.filename) : undefined;
  res.json(await verificationService.upsert(normalizedType(req), req.params.workerId, req.body, documentUrl, req.user));
});

module.exports = { list, getOne, upsert };
