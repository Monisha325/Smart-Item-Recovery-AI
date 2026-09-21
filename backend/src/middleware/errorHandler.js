const { error } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  logger.error(err.message, { path: req.path, stack: err.stack });

  if (err.name === 'CastError') {
    return error(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return error(res, `Duplicate value for ${field}`, 409);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return error(res, 'Validation failed', 422, errors);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return error(res, 'Invalid or expired token', 401);
  }

  return error(res, err.message || 'Internal server error', err.statusCode || 500);
}

module.exports = errorHandler;
