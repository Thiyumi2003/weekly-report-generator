const { body } = require('express-validator');

const baseReportRules = [
  body('week')
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage('Week identifier is required (e.g. YYYY-WXX)'),
  body('startDate')
    .optional({ nullable: true })
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),
  body('endDate')
    .optional({ nullable: true })
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date'),
  body('project')
    .optional({ nullable: true })
    .notEmpty()
    .withMessage('Project is required')
    .isMongoId()
    .withMessage('Invalid project ID format'),
  body('tasksCompleted')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Tasks Completed must be an array of strings'),
  body('tasksPlanned')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Tasks Planned must be an array of strings'),
  body('blockers')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Blockers must be an array of strings'),
  body('hoursWorked')
    .optional({ nullable: true })
    .notEmpty()
    .withMessage('Hours worked is required')
    .isFloat({ min: 0 })
    .withMessage('Hours worked must be a positive number'),
  body('notes')
    .optional({ nullable: true })
    .trim(),
  body('status')
    .optional()
    .isIn(['Draft', 'Submitted', 'Late', 'Approved'])
    .withMessage('Invalid status')
];

const reportRules = [
  ...baseReportRules,
  body('week').notEmpty().withMessage('Week identifier is required (e.g. YYYY-WXX)'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required'),
  body('project').notEmpty().withMessage('Project is required'),
  body('tasksCompleted').notEmpty().withMessage('Tasks Completed are required'),
  body('tasksPlanned').notEmpty().withMessage('Tasks Planned are required'),
  body('hoursWorked').notEmpty().withMessage('Hours worked is required')
];

const reportUpdateRules = baseReportRules;

module.exports = {
  reportRules,
  reportUpdateRules
};
