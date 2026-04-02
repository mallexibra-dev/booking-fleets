const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');

/**
 * Vehicle Routes
 */

// Get all vehicles
router.get(
  '/',
  authenticate,
  vehicleController.getAllVehicles
);

// Get vehicle by ID
router.get(
  '/:id',
  authenticate,
  vehicleController.getVehicleById
);

// Create vehicle (Admin only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  ],
  validate,
  vehicleController.createVehicle
);

// Update vehicle (Admin only)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  vehicleController.updateVehicle
);

// Delete vehicle (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  vehicleController.deleteVehicle
);

// Update vehicle status (Admin only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  [body('status').isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'UNAVAILABLE'])],
  validate,
  vehicleController.updateVehicleStatus
);

// Check vehicle availability
router.get(
  '/:id/availability',
  authenticate,
  vehicleController.checkAvailability
);

module.exports = router;
