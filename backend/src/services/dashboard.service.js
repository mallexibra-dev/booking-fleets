const prisma = require('../config/database');
const { BookingStatus, ApprovalStatus } = require('../config/constants');

/**
 * Dashboard Service - Aggregates data for dashboard
 */
class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(filters = {}) {
    const { startDate, endDate, userId } = filters;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const whereClause = {
      createdAt: dateFilter,
      ...(userId && { userId }),
    };

    // Get all counts in parallel
    const [
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      inProgressBookings,
      completedBookings,
      totalVehicles,
      availableVehicles,
      totalDrivers,
      availableDrivers,
      pendingApprovals,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count({ where: whereClause }),

      // Pending bookings
      prisma.booking.count({
        where: { ...whereClause, status: BookingStatus.PENDING },
      }),

      // Approved bookings
      prisma.booking.count({
        where: { ...whereClause, status: BookingStatus.APPROVED },
      }),

      // Rejected bookings
      prisma.booking.count({
        where: { ...whereClause, status: BookingStatus.REJECTED },
      }),

      // In progress bookings
      prisma.booking.count({
        where: { ...whereClause, status: BookingStatus.IN_PROGRESS },
      }),

      // Completed bookings
      prisma.booking.count({
        where: { ...whereClause, status: BookingStatus.COMPLETED },
      }),

      // Total vehicles
      prisma.vehicle.count(),

      // Available vehicles
      prisma.vehicle.count({
        where: { status: 'AVAILABLE' },
      }),

      // Total drivers
      prisma.driver.count(),

      // Available drivers
      prisma.driver.count({
        where: { status: 'AVAILABLE' },
      }),

      // Pending approvals
      prisma.approval.count({
        where: { status: ApprovalStatus.PENDING },
      }),
    ]);

    return {
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        approved: approvedBookings,
        rejected: rejectedBookings,
        inProgress: inProgressBookings,
        completed: completedBookings,
      },
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        inUse: totalVehicles - availableVehicles,
      },
      drivers: {
        total: totalDrivers,
        available: availableDrivers,
        onDuty: totalDrivers - availableDrivers,
      },
      approvals: {
        pending: pendingApprovals,
      },
    };
  }

  /**
   * Get recent bookings
   */
  async getRecentBookings(limit = 10) {
    const bookings = await prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        vehicle: true,
        driver: true,
        approvals: {
          select: {
            id: true,
            status: true,
            level: true,
          },
          orderBy: { level: 'asc' },
        },
      },
    });

    return bookings;
  }

  /**
   * Get booking status distribution over time
   */
  async getBookingTrends(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        status: true,
        createdAt: true,
      },
    });

    // Group by date and status
    const trends = {};
    bookings.forEach((booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = {
          date,
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
        };
      }
      trends[date].total++;
      if (booking.status === BookingStatus.APPROVED || booking.status === BookingStatus.COMPLETED) {
        trends[date].approved++;
      } else if (booking.status === BookingStatus.REJECTED) {
        trends[date].rejected++;
      } else if (booking.status === BookingStatus.PENDING) {
        trends[date].pending++;
      }
    });

    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get vehicle utilization
   */
  async getVehicleUtilization(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                createdAt: { gte: startDate },
                status: { in: [BookingStatus.APPROVED, BookingStatus.COMPLETED, BookingStatus.IN_PROGRESS] },
              },
            },
          },
        },
      },
    });

    return vehicles.map((vehicle) => ({
      id: vehicle.id,
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      status: vehicle.status,
      bookingCount: vehicle._count.bookings,
    }));
  }

  /**
   * Get approver statistics
   */
  async getApproverStats() {
    const approvers = await prisma.user.findMany({
      where: {
        role: 'APPROVER',
      },
      include: {
        _count: {
          select: {
            approvals: true,
          },
        },
        approvals: {
          where: {
            reviewedAt: { not: null },
          },
          select: {
            status: true,
          },
        },
      },
    });

    return approvers.map((approver) => {
      const totalReviewed = approver.approvals.length;
      const approved = approver.approvals.filter((a) => a.status === ApprovalStatus.APPROVED).length;
      const rejected = approver.approvals.filter((a) => a.status === ApprovalStatus.REJECTED).length;
      const pending = approver._count.approvals - totalReviewed;

      return {
        id: approver.id,
        name: approver.name,
        email: approver.email,
        totalApprovals: approver._count.approvals,
        reviewed: totalReviewed,
        approved,
        rejected,
        pending,
      };
    });
  }
}

module.exports = new DashboardService();
