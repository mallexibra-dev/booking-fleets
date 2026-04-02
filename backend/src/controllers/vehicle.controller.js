const vehicleService = require('../services/vehicle.service');
const { success: SuccessResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Vehicle Controller
 * Handles HTTP requests for vehicles
 */
class VehicleController {
  /**
   * Get all vehicles
   * GET /vehicles
   */
  getAllVehicles = asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      type: req.query.type,
      availableOnly: req.query.availableOnly === 'true',
    };

    const vehicles = await vehicleService.getAllVehicles(filters);

    return SuccessResponse(res, 200, 'Vehicles retrieved successfully', vehicles);
  });

  /**
   * Get vehicle by ID
   * GET /vehicles/:id
   */
  getVehicleById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id);

    return SuccessResponse(res, 200, 'Vehicle retrieved successfully', vehicle);
  });

  /**
   * Create vehicle
   * POST /vehicles
   */
  createVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.createVehicle(req.body);

    return SuccessResponse(res, 201, 'Vehicle created successfully', vehicle);
  });

  /**
   * Update vehicle
   * PUT /vehicles/:id
   */
  updateVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const vehicle = await vehicleService.updateVehicle(id, req.body);

    return SuccessResponse(res, 200, 'Vehicle updated successfully', vehicle);
  });

  /**
   * Delete vehicle
   * DELETE /vehicles/:id
   */
  deleteVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await vehicleService.deleteVehicle(id);

    return SuccessResponse(res, 200, result.message);
  });

  /**
   * Update vehicle status
   * PATCH /vehicles/:id/status
   */
  updateVehicleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const vehicle = await vehicleService.updateVehicleStatus(id, status);

    return SuccessResponse(res, 200, 'Vehicle status updated successfully', vehicle);
  });

  /**
   * Check vehicle availability
   * GET /vehicles/:id/availability
   */
  checkAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startTime, endTime } = req.query;

    const result = await vehicleService.checkAvailability(id, startTime, endTime);

    return SuccessResponse(res, 200, 'Availability checked successfully', result);
  });
}

module.exports = new VehicleController();
