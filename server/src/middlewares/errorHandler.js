const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      fieldErrors: err.fieldErrors,
    });
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({ message: `${field} already exists` });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' });
  }

  if (err.code === 'P2003') {
    return res.status(409).json({ message: 'Cannot complete this action — the record is referenced elsewhere' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

module.exports = errorHandler;
