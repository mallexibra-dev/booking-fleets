require('dotenv').config();
const app = require('./src/app');

/**
 * Server Entry Point
 */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Fleet Management & Vehicle Booking System API           ║
║                                                            ║
║   Server running on: http://localhost:${PORT}               ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║                                                            ║
║   Available Endpoints:                                    ║
║   - POST   /api/bookings                                  ║
║   - GET    /api/bookings                                  ║
║   - GET    /api/bookings/:id                              ║
║   - POST   /api/bookings/:id/assign                       ║
║   - POST   /api/approvals/:id/approve                     ║
║   - POST   /api/approvals/:id/reject                      ║
║   - GET    /api/dashboard                                 ║
║   - GET    /api/reports/export                            ║
║   - GET    /api/vehicles                                  ║
║   - GET    /api/drivers                                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
