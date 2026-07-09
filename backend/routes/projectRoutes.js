const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { projectRules } = require('../validations/projectValidation');
const validateRequest = require('../middleware/validationMiddleware');

// All project routes require authentication
router.use(protect);

router.get('/', getProjects);

// Manager-only routes
router.post('/', authorize('Manager'), projectRules, validateRequest, createProject);
router.put('/:id', authorize('Manager'), projectRules, validateRequest, updateProject);
router.delete('/:id', authorize('Manager'), deleteProject);

module.exports = router;
