const jwtUtil = require('../utils/jwt');
const authService = require('../services/auth.service');
const { error: ErrorResponse } = require('../utils/response');

/**
 * JWT Authentication Middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ErrorResponse(res, 401, 'Authentication required. Please provide a valid Bearer token.');
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return ErrorResponse(res, 401, 'Authentication required. Token is missing.');
    }

    // Verify token
    const decoded = jwtUtil.verifyAccessToken(token);

    // Get user from database to ensure user still exists and is active
    const user = await authService.getUserById(decoded.id);

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ErrorResponse(res, 401, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return ErrorResponse(res, 401, 'Token expired. Please login again.');
    }
    return ErrorResponse(res, 401, 'Authentication failed');
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        const decoded = jwtUtil.verifyAccessToken(token);
        const user = await authService.getUserById(decoded.id);
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Authorization Middleware - Check user role
 * @param  {...string} allowedRoles - Roles that are allowed
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // User should be attached by authenticate middleware
    if (!req.user) {
      return ErrorResponse(res, 401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ErrorResponse(res, 403, 'You do not have permission to perform this action');
    }

    next();
  };
};

module.exports = { authenticate, optionalAuth, authorize };
