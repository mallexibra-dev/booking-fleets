const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createBookingValidation,
  getBookingValidation,
  updateBookingValidation,
  assignBookingValidation,
  bookingQueryValidation,
} = require('../validations/booking.validation');

/**
 * Booking Routes
 */

// Create booking
router.post(
  '/',
  authenticate,
  createBookingValidation,
  validate,
  bookingController.createBooking
);

// Get all bookings
router.get(
  '/',
  authenticate,
  bookingQueryValidation,
  validate,
  bookingController.getAllBookings
);

// Get booking by ID
router.get(
  '/:id',
  authenticate,
  getBookingValidation,
  validate,
  bookingController.getBookingById
);

// Update booking
router.put(
  '/:id',
  authenticate,
  updateBookingValidation,
  validate,
  bookingController.updateBooking
);

// Delete booking
router.delete(
  '/:id',
  authenticate,
  getBookingValidation,
  validate,
  bookingController.deleteBooking
);

// Assign vehicle and driver
router.post(
  '/:id/assign',
  authenticate,
  assignBookingValidation,
  validate,
  bookingController.assignVehicleDriver
);

// Cancel booking
router.post(
  '/:id/cancel',
  authenticate,
  getBookingValidation,
  validate,
  bookingController.cancelBooking
);

// Complete booking
router.post(
  '/:id/complete',
  authenticate,
  getBookingValidation,
  validate,
  bookingController.completeBooking
);

module.exports = router;
