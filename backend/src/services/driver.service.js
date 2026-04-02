const prisma = require('../config/database');
const { DriverStatus } = require('../config/constants');
const AppError = require('../utils/appError');

/**
 * Driver Service
 */
class DriverService {
  /**
   * Get all drivers
   */
  async getAllDrivers(filters = {}) {
    const { status, availableOnly } = filters;

    const where = {};
    if (status) where.status = status;
    if (availableOnly) where.status = DriverStatus.AVAILABLE;

    const drivers = await prisma.driver.findMany({
      where,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return drivers;
  }

  /**
   * Get driver by ID
   */
  async getDriverById(driverId) {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        _count: {
          select: { bookings: true },
        },
        bookings: {
          take: 10,
          orderBy: { startTime: 'desc' },
          include: {
            vehicle: {
              select: { id: true, name: true, plateNumber: true },
            },
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    return driver;
  }

  /**
   * Create driver
   */
  async createDriver(data) {
    const driver = await prisma.driver.create({
      data,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return driver;
  }

  /**
   * Update driver
   */
  async updateDriver(driverId, data) {
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return driver;
  }

  /**
   * Delete driver
   */
  async deleteDriver(driverId) {
    // Check if driver has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        driverId,
        status: { in: ['APPROVED', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      throw new AppError('Cannot delete driver with active bookings', 400);
    }

    await prisma.driver.delete({
      where: { id: driverId },
    });

    return { message: 'Driver deleted successfully' };
  }

  /**
   * Update driver status
   */
  async updateDriverStatus(driverId, status) {
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { status },
    });

    return driver;
  }

  /**
   * Get available drivers for a time period
   */
  async getAvailableDrivers(startTime, endTime, excludeBookingId = null) {
    // Get all drivers
    const allDrivers = await prisma.driver.findMany({
      where: { status: DriverStatus.AVAILABLE },
    });

    // Get drivers who are booked during this time
    const bookedDrivers = await prisma.booking.findMany({
      where: {
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
      select: { driverId: true },
    });

    const bookedDriverIds = new Set(
      bookedDrivers.map((b) => b.driverId).filter(Boolean)
    );

    // Filter out booked drivers
    const availableDrivers = allDrivers.filter(
      (driver) => !bookedDriverIds.has(driver.id)
    );

    return availableDrivers;
  }
}

module.exports = new DriverService();
