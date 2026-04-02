const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { exportReportValidation } = require('../validations/report.validation');

/**
 * Report Routes
 */

// Export bookings to Excel
router.get(
  '/export',
  authenticate,
  exportReportValidation,
  validate,
  reportController.exportBookings
);

// Get report data
router.get(
  '/data',
  authenticate,
  reportController.getReportData
);

// Get report summary
router.get(
  '/summary',
  authenticate,
  reportController.getReportSummary
);

module.exports = router;
