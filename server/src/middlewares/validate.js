const ApiError = require('../utils/ApiError');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || 'root';
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return next(new ApiError(400, 'Validation failed', fieldErrors));
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
