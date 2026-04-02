/**
 * Standardized API Response Utility
 */

const success = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
  };
  return res.status(statusCode).json(response);
};

const error = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors }),
  };
  return res.status(statusCode).json(response);
};

module.exports = { success, error };
