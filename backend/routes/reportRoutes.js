const express = require('express');
const router = express.Router();
const { getReports, getReport, createReport, updateReport, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { reportRules, reportUpdateRules } = require('../validations/reportValidation');
const validateRequest = require('../middleware/validationMiddleware');

// All report routes require authentication
router.use(protect);

router.route('/')
  .get(getReports)
  .post(reportRules, validateRequest, createReport);

router.route('/:id')
  .get(getReport)
  .put(reportUpdateRules, validateRequest, updateReport)
  .delete(deleteReport);

module.exports = router;
