const prisma = require('../config/database');
const { BookingStatus, ApprovalStatus } = require('../config/constants');
const AppError = require('../utils/appError');

/**
 * Approval Service - Contains all approval business logic
 */
class ApprovalService {
  /**
   * Get approval by ID
   */
  async getApprovalById(approvalId) {
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        booking: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
            vehicle: true,
            driver: true,
          },
        },
        approver: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!approval) {
      throw new AppError('Approval not found', 404);
    }

    return approval;
  }

  /**
   * Approve a booking approval
   * CRITICAL LOGIC: Booking is APPROVED only if ALL approvals are approved
   */
  async approveApproval(approvalId, approverId, comments) {
    const approval = await this.getApprovalById(approvalId);

    // Verify the approver is the one assigned
    if (approval.approverId !== approverId) {
      throw new AppError('You are not authorized to approve this request', 403);
    }

    // Check if already processed
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new AppError('This approval has already been processed', 400);
    }

    // Check if booking is still pending
    if (approval.booking.status !== BookingStatus.PENDING) {
      throw new AppError('Booking is not in a pending state', 400);
    }

    // Update approval status
    const updatedApproval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: ApprovalStatus.APPROVED,
        comments,
        reviewedAt: new Date(),
      },
      include: {
        approver: {
          select: { id: true, name: true, email: true, role: true },
        },
        booking: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            vehicle: true,
            driver: true,
          },
        },
      },
    });

    // Check all approvals for this booking
    const allApprovals = await prisma.approval.findMany({
      where: { bookingId: approval.bookingId },
      orderBy: { level: 'asc' },
    });

    // CRITICAL LOGIC: Check if ALL approvals are approved
    const allApproved = allApprovals.every((a) => a.status === ApprovalStatus.APPROVED);
    const hasRejected = allApprovals.some((a) => a.status === ApprovalStatus.REJECTED);

    // Update booking status based on approvals
    if (hasRejected) {
      await prisma.booking.update({
        where: { id: approval.bookingId },
        data: { status: BookingStatus.REJECTED },
      });
    } else if (allApproved) {
      await prisma.booking.update({
        where: { id: approval.bookingId },
        data: { status: BookingStatus.APPROVED },
      });
    }

    return updatedApproval;
  }

  /**
   * Reject a booking approval
   * CRITICAL LOGIC: Any rejection causes the booking to be rejected
   */
  async rejectApproval(approvalId, approverId, comments) {
    const approval = await this.getApprovalById(approvalId);

    // Verify the approver is the one assigned
    if (approval.approverId !== approverId) {
      throw new AppError('You are not authorized to reject this request', 403);
    }

    // Check if already processed
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new AppError('This approval has already been processed', 400);
    }

    // Check if booking is still pending
    if (approval.booking.status !== BookingStatus.PENDING) {
      throw new AppError('Booking is not in a pending state', 400);
    }

    // Update approval status
    const updatedApproval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: ApprovalStatus.REJECTED,
        comments,
        reviewedAt: new Date(),
      },
      include: {
        approver: {
          select: { id: true, name: true, email: true, role: true },
        },
        booking: {
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
        },
      },
    });

    // CRITICAL LOGIC: Any rejection causes the booking to be rejected
    await prisma.booking.update({
      where: { id: approval.bookingId },
      data: { status: BookingStatus.REJECTED },
    });

    return updatedApproval;
  }

  /**
   * Get all pending approvals for a user
   */
  async getPendingApprovals(approverId, filters = {}) {
    const { page = 1, limit = 20 } = filters;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const where = {
      approverId,
      status: ApprovalStatus.PENDING,
      booking: {
        status: BookingStatus.PENDING,
      },
    };

    const [approvals, total] = await Promise.all([
      prisma.approval.findMany({
        where,
        include: {
          booking: {
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
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.approval.count({ where }),
    ]);

    return {
      approvals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get all approvals for a booking
   */
  async getBookingApprovals(bookingId) {
    const approvals = await prisma.approval.findMany({
      where: { bookingId },
      include: {
        approver: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { level: 'asc' },
    });

    return approvals;
  }

  /**
   * Create approval chain for a booking
   */
  async createApprovalChain(bookingId, approverIds) {
    const approvalPromises = approverIds.map((approverId, index) =>
      prisma.approval.create({
        data: {
          bookingId,
          approverId,
          level: index + 1,
          status: ApprovalStatus.PENDING,
        },
      })
    );

    const approvals = await Promise.all(approvalPromises);

    // Update booking status to PENDING
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.PENDING },
    });

    return approvals;
  }
}

module.exports = new ApprovalService();
