const { query } = require('express-validator');

/**
 * Validation rules for report export
 */
const exportReportValidation = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date'),

  query('status')
    .optional()
    .isIn(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Invalid status value'),

  query('format')
    .optional()
    .isIn(['xlsx', 'csv'])
    .withMessage('Format must be xlsx or csv'),
];

module.exports = {
  exportReportValidation,
};
