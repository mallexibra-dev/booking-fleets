const { error: ErrorResponse } = require('../utils/response');
const AppError = require('../utils/appError');

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;

  // Prisma Validation Error
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    error = new AppError(`Duplicate value for ${field}. Please use another value.`, 409);
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    error = new AppError('Record not found.', 404);
  }

  // Prisma Foreign Key Constraint
  if (err.code === 'P2003') {
    error = new AppError('Related record not found.', 400);
  }

  // Prisma Validation Error
  if (err.code === 'P2014') {
    error = new AppError('The change would violate required relations.', 400);
  }

  // Validation Errors (express-validator)
  if (err.name === 'ValidationError' || err.errors) {
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    error = new AppError('Validation failed', 400);
    return ErrorResponse(res, 400, 'Validation failed', { errors });
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Something went wrong on the server.';

  ErrorResponse(res, statusCode, message, process.env.NODE_ENV === 'development' ? { stack: err.stack } : null);
};

module.exports = errorHandler;
