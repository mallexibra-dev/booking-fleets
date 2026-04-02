/**
 * Application Constants
 */

const UserRole = {
  ADMIN: 'ADMIN',
  APPROVER: 'APPROVER',
  EMPLOYEE: 'EMPLOYEE',
};

const BookingStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  IN_USE: 'IN_USE',
  MAINTENANCE: 'MAINTENANCE',
  UNAVAILABLE: 'UNAVAILABLE',
};

const DriverStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_DUTY: 'ON_DUTY',
  UNAVAILABLE: 'UNAVAILABLE',
};

const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  UserRole,
  BookingStatus,
  ApprovalStatus,
  VehicleStatus,
  DriverStatus,
  HttpStatus,
};
