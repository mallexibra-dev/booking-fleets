const reportService = require('../services/report.service');
const { success: SuccessResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

/**
 * Report Controller
 * Handles HTTP requests for reports and exports
 */
class ReportController {
  /**
   * Export bookings to Excel
   * GET /reports/export
   */
  exportBookings = asyncHandler(async (req, res) => {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
    };

    const { workbook, filename, bookingCount } = await reportService.exportBookingsToExcel(filters);

    // Ensure exports directory exists
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send workbook as buffer
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  });

  /**
   * Get report data (without Excel generation)
   * GET /reports/data
   */
  getReportData = asyncHandler(async (req, res) => {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await reportService.getReportData(filters);

    return SuccessResponse(res, 200, 'Report data retrieved successfully', result);
  });

  /**
   * Get report summary statistics
   * GET /reports/summary
   */
  getReportSummary = asyncHandler(async (req, res) => {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const summary = await reportService.getReportSummary(filters);

    return SuccessResponse(res, 200, 'Report summary retrieved successfully', summary);
  });
}

module.exports = new ReportController();
