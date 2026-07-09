const { body } = require('express-validator');

const projectRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 500 })
    .withMessage('Project description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['Active', 'Completed', 'On Hold'])
    .withMessage('Status must be Active, Completed, or On Hold')
];

module.exports = {
  projectRules
};
