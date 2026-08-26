const { z } = require('zod');

const optionalString = (max) => {
  const base = max ? z.string().max(max) : z.string();
  return z.preprocess((v) => (v === '' || v === null ? undefined : v), base.optional());
};

const optionalDate = () => {
  return z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), z.coerce.date().optional());
};

const optionalNumber = () => {
  return z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), z.coerce.number().optional());
};

const optionalInt = () => {
  return z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), z.coerce.number().int().optional());
};

module.exports = { optionalString, optionalDate, optionalNumber, optionalInt };
