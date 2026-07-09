const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, getMembers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { registerRules, loginRules } = require('../validations/authValidation');
const validateRequest = require('../middleware/validationMiddleware');

router.post('/register', registerRules, validateRequest, register);
router.post('/login', loginRules, validateRequest, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/members', protect, authorize('Manager'), getMembers);

module.exports = router;

