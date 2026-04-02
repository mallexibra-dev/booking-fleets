const driverService = require('../services/driver.service');
const { success: SuccessResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Driver Controller
 * Handles HTTP requests for drivers
 */
class DriverController {
  /**
   * Get all drivers
   * GET /drivers
   */
  getAllDrivers = asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      availableOnly: req.query.availableOnly === 'true',
    };

    const drivers = await driverService.getAllDrivers(filters);

    return SuccessResponse(res, 200, 'Drivers retrieved successfully', drivers);
  });

  /**
   * Get driver by ID
   * GET /drivers/:id
   */
  getDriverById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await driverService.getDriverById(id);

    return SuccessResponse(res, 200, 'Driver retrieved successfully', driver);
  });

  /**
   * Create driver
   * POST /drivers
   */
  createDriver = asyncHandler(async (req, res) => {
    const driver = await driverService.createDriver(req.body);

    return SuccessResponse(res, 201, 'Driver created successfully', driver);
  });

  /**
   * Update driver
   * PUT /drivers/:id
   */
  updateDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await driverService.updateDriver(id, req.body);

    return SuccessResponse(res, 200, 'Driver updated successfully', driver);
  });

  /**
   * Delete driver
   * DELETE /drivers/:id
   */
  deleteDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await driverService.deleteDriver(id);

    return SuccessResponse(res, 200, result.message);
  });

  /**
   * Update driver status
   * PATCH /drivers/:id/status
   */
  updateDriverStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const driver = await driverService.updateDriverStatus(id, status);

    return SuccessResponse(res, 200, 'Driver status updated successfully', driver);
  });

  /**
   * Get available drivers for a time period
   * GET /drivers/available
   */
  getAvailableDrivers = asyncHandler(async (req, res) => {
    const { startTime, endTime } = req.query;

    const drivers = await driverService.getAvailableDrivers(startTime, endTime);

    return SuccessResponse(res, 200, 'Available drivers retrieved successfully', drivers);
  });
}

module.exports = new DriverController();
