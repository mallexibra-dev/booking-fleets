const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');

/**
 * Driver Routes
 */

// Get all drivers
router.get(
  '/',
  authenticate,
  driverController.getAllDrivers
);

// Get driver by ID
router.get(
  '/:id',
  authenticate,
  driverController.getDriverById
);

// Create driver (Admin only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('licenseNo').trim().notEmpty().withMessage('License number is required'),
  ],
  validate,
  driverController.createDriver
);

// Update driver (Admin only)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  driverController.updateDriver
);

// Delete driver (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  driverController.deleteDriver
);

// Update driver status (Admin only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  [body('status').isIn(['AVAILABLE', 'ON_DUTY', 'UNAVAILABLE'])],
  validate,
  driverController.updateDriverStatus
);

// Get available drivers for a time period
router.get(
  '/available/list',
  authenticate,
  driverController.getAvailableDrivers
);

module.exports = router;
