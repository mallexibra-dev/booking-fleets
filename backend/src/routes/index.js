const express = require('express');
const router = express.Router();

/**
 * API Routes Index
 * Mounts all route modules
 */

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', require('./auth.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/approvals', require('./approval.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/reports', require('./report.routes'));
router.use('/vehicles', require('./vehicle.routes'));
router.use('/drivers', require('./driver.routes'));

module.exports = router;
