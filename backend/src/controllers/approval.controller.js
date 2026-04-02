const approvalService = require('../services/approval.service');
const { success: SuccessResponse, error: ErrorResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Approval Controller
 * Handles HTTP requests for approvals
 */
class ApprovalController {
  /**
   * Get approval by ID
   * GET /approvals/:id
   */
  getApprovalById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const approval = await approvalService.getApprovalById(id);

    return SuccessResponse(res, 200, 'Approval retrieved successfully', approval);
  });

  /**
   * Approve an approval
   * POST /approvals/:id/approve
   */
  approveApproval = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const approverId = req.user.id;
    const { comments } = req.body;

    const approval = await approvalService.approveApproval(id, approverId, comments);

    return SuccessResponse(res, 200, 'Booking approved successfully', approval);
  });

  /**
   * Reject an approval
   * POST /approvals/:id/reject
   */
  rejectApproval = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const approverId = req.user.id;
    const { comments } = req.body;

    const approval = await approvalService.rejectApproval(id, approverId, comments);

    return SuccessResponse(res, 200, 'Booking rejected successfully', approval);
  });

  /**
   * Get pending approvals for the current user
   * GET /approvals/pending
   */
  getPendingApprovals = asyncHandler(async (req, res) => {
    const approverId = req.user.id;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await approvalService.getPendingApprovals(approverId, filters);

    return SuccessResponse(res, 200, 'Pending approvals retrieved successfully', result);
  });

  /**
   * Get all approvals for a booking
   * GET /approvals/booking/:bookingId
   */
  getBookingApprovals = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const approvals = await approvalService.getBookingApprovals(bookingId);

    return SuccessResponse(res, 200, 'Booking approvals retrieved successfully', approvals);
  });
}

module.exports = new ApprovalController();
