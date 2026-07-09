const express = require('express');
const router = express.Router();
const { getSummary, getCharts, askAIAssistant } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All dashboard routes require authentication
router.use(protect);

router.get('/summary', getSummary);
router.get('/charts', getCharts);

// Manager-only AI Assistant route
router.post('/ai', authorize('Manager'), askAIAssistant);

module.exports = router;
