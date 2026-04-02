const bookingService = require('../services/booking.service');
const { success: SuccessResponse, error: ErrorResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Booking Controller
 * Handles HTTP requests for bookings
 */
class BookingController {
  /**
   * Create a new booking
   * POST /bookings
   */
  createBooking = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const booking = await bookingService.createBooking(req.body, userId);

    return SuccessResponse(res, 201, 'Booking created successfully', booking);
  });

  /**
   * Get all bookings with filters
   * GET /bookings
   */
  getAllBookings = asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      userId: req.query.userId,
      vehicleId: req.query.vehicleId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await bookingService.getAllBookings(filters);

    return SuccessResponse(res, 200, 'Bookings retrieved successfully', result);
  });

  /**
   * Get booking by ID
   * GET /bookings/:id
   */
  getBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);

    return SuccessResponse(res, 200, 'Booking retrieved successfully', booking);
  });

  /**
   * Update booking
   * PUT /bookings/:id
   */
  updateBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const booking = await bookingService.updateBooking(id, req.body, userId);

    return SuccessResponse(res, 200, 'Booking updated successfully', booking);
  });

  /**
   * Delete booking
   * DELETE /bookings/:id
   */
  deleteBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await bookingService.deleteBooking(id, userId);

    return SuccessResponse(res, 200, result.message);
  });

  /**
   * Assign vehicle and driver to booking
   * POST /bookings/:id/assign
   */
  assignVehicleDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await bookingService.assignVehicleDriver(id, req.body);

    return SuccessResponse(res, 200, 'Vehicle and driver assigned successfully', booking);
  });

  /**
   * Cancel booking
   * POST /bookings/:id/cancel
   */
  cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const booking = await bookingService.cancelBooking(id, userId);

    return SuccessResponse(res, 200, 'Booking cancelled successfully', booking);
  });

  /**
   * Complete booking
   * POST /bookings/:id/complete
   */
  completeBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await bookingService.completeBooking(id);

    return SuccessResponse(res, 200, 'Booking completed successfully', booking);
  });
}

module.exports = new BookingController();
