const prisma = require('../config/database');
const { VehicleStatus } = require('../config/constants');
const AppError = require('../utils/appError');

/**
 * Vehicle Service
 */
class VehicleService {
  /**
   * Get all vehicles
   */
  async getAllVehicles(filters = {}) {
    const { status, type, availableOnly } = filters;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (availableOnly) where.status = VehicleStatus.AVAILABLE;

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return vehicles;
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        _count: {
          select: { bookings: true },
        },
        bookings: {
          take: 10,
          orderBy: { startTime: 'desc' },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    return vehicle;
  }

  /**
   * Create vehicle
   */
  async createVehicle(data) {
    const vehicle = await prisma.vehicle.create({
      data,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return vehicle;
  }

  /**
   * Update vehicle
   */
  async updateVehicle(vehicleId, data) {
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return vehicle;
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(vehicleId) {
    // Check if vehicle has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        vehicleId,
        status: { in: ['APPROVED', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      throw new AppError('Cannot delete vehicle with active bookings', 400);
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return { message: 'Vehicle deleted successfully' };
  }

  /**
   * Update vehicle status
   */
  async updateVehicleStatus(vehicleId, status) {
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status },
    });

    return vehicle;
  }

  /**
   * Check vehicle availability for a time period
   */
  async checkAvailability(vehicleId, startTime, endTime, excludeBookingId = null) {
    const conflicts = await prisma.booking.findMany({
      where: {
        vehicleId,
        status: { in: ['APPROVED', 'IN_PROGRESS'] },
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(endTime) } },
              { endTime: { gte: new Date(startTime) } },
            ],
          },
        ],
      },
    });

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }
}

module.exports = new VehicleService();
