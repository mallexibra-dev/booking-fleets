const prisma = require('../config/database');
const { BookingStatus, ApprovalStatus } = require('../config/constants');
const { hasTimeOverlap, isValidTimeRange, isPastDate } = require('../utils/dateHelpers');
const AppError = require('../utils/appError');

/**
 * Booking Service - Contains all booking business logic
 */
class BookingService {
  /**
   * Create a new booking with approval chain
   */
  async createBooking(data, userId) {
    const {
      title,
      purpose,
      startTime,
      endTime,
      pickupLocation,
      dropoffLocation,
      passengerCount,
      vehicleId,
      driverId,
      notes,
      approvalLevels,
    } = data;

    // Validate time range
    if (!isValidTimeRange(startTime, endTime)) {
      throw new AppError('End time must be after start time', 400);
    }

    // Check for vehicle conflicts if vehicle is specified
    if (vehicleId) {
      await this.checkVehicleConflict(vehicleId, startTime, endTime);
    }

    // Determine status based on approval levels
    const status = approvalLevels && approvalLevels.length > 0 ? BookingStatus.PENDING : BookingStatus.DRAFT;

    // Create booking with transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          title,
          purpose,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          pickupLocation,
          dropoffLocation,
          passengerCount,
          vehicleId,
          driverId,
          notes,
          status,
          userId,
          createdById: userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
          vehicle: true,
          driver: true,
        },
      });

      // Create approval chain if provided
      if (approvalLevels && approvalLevels.length > 0) {
        const approvalPromises = approvalLevels.map((approverId, index) =>
          tx.approval.create({
            data: {
              bookingId: newBooking.id,
              approverId,
              level: index + 1,
              status: index === 0 ? ApprovalStatus.PENDING : ApprovalStatus.PENDING,
            },
          })
        );
        await Promise.all(approvalPromises);
      }

      return newBooking;
    });

    // Fetch booking with approvals
    return await this.getBookingById(booking.id);
  }

  /**
   * Get all bookings with filters
   */
  async getAllBookings(filters = {}) {
    const { status, userId, vehicleId, startDate, endDate, page = 1, limit = 20 } = filters;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const where = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
          vehicle: true,
          driver: true,
          approvals: {
            include: {
              approver: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
            orderBy: { level: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        vehicle: true,
        driver: true,
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { level: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    return booking;
  }

  /**
   * Update booking
   */
  async updateBooking(bookingId, data, userId) {
    const booking = await this.getBookingById(bookingId);

    // Only allow updating DRAFT or PENDING bookings
    if (![BookingStatus.DRAFT, BookingStatus.PENDING].includes(booking.status)) {
      throw new AppError('Cannot update a booking that has been processed', 400);
    }

    // Check for vehicle conflicts if vehicle is being changed
    if (data.vehicleId && data.vehicleId !== booking.vehicleId) {
      const startTime = data.startTime || booking.startTime;
      const endTime = data.endTime || booking.endTime;
      await this.checkVehicleConflict(data.vehicleId, startTime, endTime);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        vehicle: true,
        driver: true,
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { level: 'asc' },
        },
      },
    });

    return updatedBooking;
  }

  /**
   * Delete booking
   */
  async deleteBooking(bookingId, userId) {
    const booking = await this.getBookingById(bookingId);

    // Only allow deleting DRAFT bookings or own bookings
    if (booking.status !== BookingStatus.DRAFT && booking.userId !== userId) {
      throw new AppError('Cannot delete this booking', 400);
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return { message: 'Booking deleted successfully' };
  }

  /**
   * Assign vehicle and driver to booking
   */
  async assignVehicleDriver(bookingId, { vehicleId, driverId }) {
    const booking = await this.getBookingById(bookingId);

    if (booking.status !== BookingStatus.APPROVED) {
      throw new AppError('Can only assign to approved bookings', 400);
    }

    // Check vehicle availability
    await this.checkVehicleConflict(vehicleId, booking.startTime, booking.endTime, bookingId);

    // Verify vehicle and driver exist
    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
      driverId ? prisma.driver.findUnique({ where: { id: driverId } }) : null,
    ]);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    if (driverId && !driver) {
      throw new AppError('Driver not found', 404);
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        vehicleId,
        driverId,
        status: BookingStatus.IN_PROGRESS,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        vehicle: true,
        driver: true,
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { level: 'asc' },
        },
      },
    });

    // Update vehicle and driver status
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'IN_USE' },
    });

    if (driverId) {
      await prisma.driver.update({
        where: { id: driverId },
        data: { status: 'ON_DUTY' },
      });
    }

    return updatedBooking;
  }

  /**
   * Check for vehicle booking conflicts
   */
  async checkVehicleConflict(vehicleId, startTime, endTime, excludeBookingId = null) {
    const conflicts = await prisma.booking.findMany({
      where: {
        vehicleId,
        status: {
          in: [BookingStatus.APPROVED, BookingStatus.IN_PROGRESS],
        },
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

    if (conflicts.length > 0) {
      throw new AppError('Vehicle is already booked for this time period', 409);
    }

    return true;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId) {
    const booking = await this.getBookingById(bookingId);

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new AppError('Cannot cancel this booking', 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        vehicle: true,
        driver: true,
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { level: 'asc' },
        },
      },
    });

    return updatedBooking;
  }

  /**
   * Complete booking
   */
  async completeBooking(bookingId) {
    const booking = await this.getBookingById(bookingId);

    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new AppError('Can only complete in-progress bookings', 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.COMPLETED },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        vehicle: true,
        driver: true,
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { level: 'asc' },
        },
      },
    });

    // Update vehicle and driver status back to available
    if (booking.vehicleId) {
      await prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    if (booking.driverId) {
      await prisma.driver.update({
        where: { id: booking.driverId },
        data: { status: 'AVAILABLE' },
      });
    }

    return updatedBooking;
  }
}

module.exports = new BookingService();
