const ExcelJS = require('exceljs');
const prisma = require('../config/database');
const { BookingStatus } = require('../config/constants');
const path = require('path');

/**
 * Report Service - Handles report generation and export
 */
class ReportService {
  /**
   * Export bookings to Excel
   */
  async exportBookingsToExcel(filters = {}) {
    const { startDate, endDate, status } = filters;

    // Build where clause
    const where = {};
    if (startDate) where.startTime = { ...where.startTime, gte: new Date(startDate) };
    if (endDate) where.startTime = { ...where.startTime, lte: new Date(endDate) };
    if (status) where.status = status;

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
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
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { level: 'asc' },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings Report');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Purpose', key: 'purpose', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'User', key: 'userName', width: 20 },
      { header: 'User Email', key: 'userEmail', width: 25 },
      { header: 'Vehicle', key: 'vehicle', width: 20 },
      { header: 'Driver', key: 'driver', width: 20 },
      { header: 'Start Time', key: 'startTime', width: 20 },
      { header: 'End Time', key: 'endTime', width: 20 },
      { header: 'Pickup Location', key: 'pickupLocation', width: 30 },
      { header: 'Dropoff Location', key: 'dropoffLocation', width: 30 },
      { header: 'Passengers', key: 'passengerCount', width: 12 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Approval Status', key: 'approvalStatus', width: 20 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows
    bookings.forEach((booking) => {
      const approvalStatus = this.getApprovalStatusText(bookings, booking);

      worksheet.addRow({
        id: booking.id,
        title: booking.title,
        purpose: booking.purpose,
        status: booking.status,
        userName: booking.user?.name || 'N/A',
        userEmail: booking.user?.email || 'N/A',
        vehicle: booking.vehicle?.name || 'N/A',
        driver: booking.driver?.name || 'N/A',
        startTime: this.formatDateTime(booking.startTime),
        endTime: this.formatDateTime(booking.endTime),
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        passengerCount: booking.passengerCount,
        notes: booking.notes || 'N/A',
        createdAt: this.formatDateTime(booking.createdAt),
        approvalStatus,
      });
    });

    // Auto-fit columns (additional adjustment)
    worksheet.columns.forEach((column) => {
      if (column.eachCell) {
        column.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
      }
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      row.height = rowNumber === 1 ? 25 : 20;
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `bookings-report-${timestamp}.xlsx`;
    const filepath = path.join(process.cwd(), 'exports', filename);

    return { workbook, filename, filepath, bookingCount: bookings.length };
  }

  /**
   * Get approval status text for a booking
   */
  getApprovalStatusText(bookings, booking) {
    if (!booking.approvals || booking.approvals.length === 0) {
      return 'No Approval Required';
    }

    const allApproved = booking.approvals.every((a) => a.status === 'APPROVED');
    const anyRejected = booking.approvals.some((a) => a.status === 'REJECTED');
    const pendingCount = booking.approvals.filter((a) => a.status === 'PENDING').length;

    if (anyRejected) {
      return 'Rejected';
    } else if (allApproved) {
      return 'Fully Approved';
    } else {
      return `Pending (${pendingCount}/${booking.approvals.length})`;
    }
  }

  /**
   * Format date time for Excel
   */
  formatDateTime(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get bookings for report (without Excel generation)
   */
  async getReportData(filters = {}) {
    const { startDate, endDate, status, page = 1, limit = 100 } = filters;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const where = {};
    if (startDate) where.startTime = { ...where.startTime, gte: new Date(startDate) };
    if (endDate) where.startTime = { ...where.startTime, lte: new Date(endDate) };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
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
        orderBy: { startTime: 'desc' },
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
   * Get summary statistics for report
   */
  async getReportSummary(filters = {}) {
    const { startDate, endDate } = filters;

    const where = {};
    if (startDate) where.startTime = { ...where.startTime, gte: new Date(startDate) };
    if (endDate) where.startTime = { ...where.startTime, lte: new Date(endDate) };

    const [
      totalBookings,
      statusBreakdown,
      vehicleUsage,
      driverUsage,
    ] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.booking.groupBy({
        by: ['vehicleId'],
        where: { ...where, vehicleId: { not: null } },
        _count: true,
        orderBy: { _count: { vehicleId: 'desc' } },
        take: 10,
      }),
      prisma.booking.groupBy({
        by: ['driverId'],
        where: { ...where, driverId: { not: null } },
        _count: true,
        orderBy: { _count: { driverId: 'desc' } },
        take: 10,
      }),
    ]);

    // Get vehicle and driver details
    const vehicleIds = vehicleUsage.map((v) => v.vehicleId);
    const driverIds = driverUsage.map((d) => d.driverId);

    const [vehicles, drivers] = await Promise.all([
      prisma.vehicle.findMany({
        where: { id: { in: vehicleIds } },
        select: { id: true, name: true, plateNumber: true },
      }),
      prisma.driver.findMany({
        where: { id: { in: driverIds } },
        select: { id: true, name: true },
      }),
    ]);

    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    return {
      total: totalBookings,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      topVehicles: vehicleUsage.map((v) => ({
        ...vehicleMap.get(v.vehicleId),
        bookingCount: v._count,
      })),
      topDrivers: driverUsage.map((d) => ({
        ...driverMap.get(d.driverId),
        bookingCount: d._count,
      })),
    };
  }
}

module.exports = new ReportService();
