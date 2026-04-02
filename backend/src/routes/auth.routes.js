const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

/**
 * Authentication Routes
 */

// Login - no authentication required
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Refresh token - no authentication required
router.post(
  '/refresh',
  [
    body('refreshToken').trim().notEmpty().withMessage('Refresh token is required'),
  ],
  validate,
  authController.refreshToken
);

// Get current user profile - authentication required
router.get(
  '/me',
  authenticate,
  authController.getProfile
);

// Register new user - admin only (optional)
router.post(
  '/register',
  authenticate,
  require('../middlewares/auth').authorize('ADMIN'),
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['ADMIN', 'APPROVER', 'EMPLOYEE']).withMessage('Invalid role'),
  ],
  validate,
  authController.register
);

// Change password - authentication required
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').trim().notEmpty().withMessage('Current password is required'),
    body('newPassword').trim().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  authController.changePassword
);

// Logout - authentication required
router.post(
  '/logout',
  authenticate,
  authController.logout
);

module.exports = router;
