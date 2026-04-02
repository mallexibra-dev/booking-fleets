const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { approvalActionValidation, getBookingValidation } = require('../validations/booking.validation');

/**
 * Approval Routes
 */

// Get approval by ID
router.get(
  '/:id',
  authenticate,
  approvalController.getApprovalById
);

// Approve an approval
router.post(
  '/:id/approve',
  authenticate,
  authorize('APPROVER', 'ADMIN'),
  approvalActionValidation,
  validate,
  approvalController.approveApproval
);

// Reject an approval
router.post(
  '/:id/reject',
  authenticate,
  authorize('APPROVER', 'ADMIN'),
  approvalActionValidation,
  validate,
  approvalController.rejectApproval
);

// Get pending approvals for current user
router.get(
  '/pending/list',
  authenticate,
  authorize('APPROVER', 'ADMIN'),
  approvalController.getPendingApprovals
);

// Get all approvals for a booking
router.get(
  '/booking/:bookingId',
  authenticate,
  getBookingValidation,
  validate,
  approvalController.getBookingApprovals
);

module.exports = router;
