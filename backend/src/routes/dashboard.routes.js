const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth');

/**
 * Dashboard Routes
 */

// Get dashboard statistics
router.get(
  '/',
  authenticate,
  dashboardController.getDashboardStats
);

// Get recent bookings
router.get(
  '/recent-bookings',
  authenticate,
  dashboardController.getRecentBookings
);

// Get booking trends
router.get(
  '/trends',
  authenticate,
  dashboardController.getBookingTrends
);

// Get vehicle utilization
router.get(
  '/vehicle-utilization',
  authenticate,
  dashboardController.getVehicleUtilization
);

// Get approver statistics
router.get(
  '/approver-stats',
  authenticate,
  dashboardController.getApproverStats
);

module.exports = router;
