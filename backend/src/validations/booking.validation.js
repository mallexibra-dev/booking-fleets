const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a booking
 */
const createBookingValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Purpose must be between 5 and 500 characters'),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid date'),

  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid date'),

  body('pickupLocation')
    .trim()
    .notEmpty()
    .withMessage('Pickup location is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Pickup location must be between 3 and 200 characters'),

  body('dropoffLocation')
    .trim()
    .notEmpty()
    .withMessage('Dropoff location is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Dropoff location must be between 3 and 200 characters'),

  body('passengerCount')
    .notEmpty()
    .withMessage('Passenger count is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('Passenger count must be between 1 and 50'),

  body('vehicleId')
    .optional()
    .isUUID()
    .withMessage('Vehicle ID must be a valid UUID'),

  body('driverId')
    .optional()
    .isUUID()
    .withMessage('Driver ID must be a valid UUID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('approvalLevels')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Approval levels must be a non-empty array'),

  body('approvalLevels.*')
    .isUUID()
    .withMessage('Each approver ID must be a valid UUID'),
];

/**
 * Validation rules for getting a booking by ID
 */
const getBookingValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid booking ID format'),
];

/**
 * Validation rules for updating a booking
 */
const updateBookingValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid booking ID format'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('purpose')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Purpose must be between 5 and 500 characters'),

  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid date'),

  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid date'),

  body('pickupLocation')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Pickup location must be between 3 and 200 characters'),

  body('dropoffLocation')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Dropoff location must be between 3 and 200 characters'),

  body('passengerCount')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Passenger count must be between 1 and 50'),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Invalid status value'),
];

/**
 * Validation rules for assigning vehicle/driver
 */
const assignBookingValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid booking ID format'),

  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isUUID()
    .withMessage('Vehicle ID must be a valid UUID'),

  body('driverId')
    .optional()
    .isUUID()
    .withMessage('Driver ID must be a valid UUID'),
];

/**
 * Validation rules for approval actions
 */
const approvalActionValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid approval ID format'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments must not exceed 500 characters'),
];

/**
 * Validation rules for booking query filters
 */
const bookingQueryValidation = [
  query('status')
    .optional()
    .isIn(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Invalid status value'),

  query('userId')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID format'),

  query('vehicleId')
    .optional()
    .isUUID()
    .withMessage('Invalid vehicle ID format'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createBookingValidation,
  getBookingValidation,
  updateBookingValidation,
  assignBookingValidation,
  approvalActionValidation,
  bookingQueryValidation,
};
