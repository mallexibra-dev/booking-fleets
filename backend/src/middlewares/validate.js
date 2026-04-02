const { validationResult } = require('express-validator');
const { error: ErrorResponse } = require('../utils/response');

/**
 * Validation Middleware
 * Checks for validation errors from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return ErrorResponse(res, 400, 'Validation failed', { errors: formattedErrors });
  }

  next();
};

module.exports = validate;
