const dashboardService = require('../services/dashboard.service');
const { success: SuccessResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard data
 */
class DashboardController {
  /**
   * Get dashboard statistics
   * GET /dashboard
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userId: req.query.userId,
    };

    const stats = await dashboardService.getDashboardStats(filters);

    return SuccessResponse(res, 200, 'Dashboard statistics retrieved successfully', stats);
  });

  /**
   * Get recent bookings
   * GET /dashboard/recent-bookings
   */
  getRecentBookings = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const bookings = await dashboardService.getRecentBookings(limit);

    return SuccessResponse(res, 200, 'Recent bookings retrieved successfully', bookings);
  });

  /**
   * Get booking trends
   * GET /dashboard/trends
   */
  getBookingTrends = asyncHandler(async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const trends = await dashboardService.getBookingTrends(days);

    return SuccessResponse(res, 200, 'Booking trends retrieved successfully', trends);
  });

  /**
   * Get vehicle utilization
   * GET /dashboard/vehicle-utilization
   */
  getVehicleUtilization = asyncHandler(async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const utilization = await dashboardService.getVehicleUtilization(days);

    return SuccessResponse(res, 200, 'Vehicle utilization retrieved successfully', utilization);
  });

  /**
   * Get approver statistics
   * GET /dashboard/approver-stats
   */
  getApproverStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getApproverStats();

    return SuccessResponse(res, 200, 'Approver statistics retrieved successfully', stats);
  });
}

module.exports = new DashboardController();
