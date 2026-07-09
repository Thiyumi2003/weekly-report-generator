const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - JWT verification
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'teampulse_secret_key_jwt');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    next();
  } catch (error) {
    console.error(`Token authentication error: ${error.message}`);
    return res.status(401).json({ success: false, message: 'Token validation failed' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
