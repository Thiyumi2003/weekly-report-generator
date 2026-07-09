const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Root endpoint for deployment health checks
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TeamPulse API is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health'
    }
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'OK', timestamp: new Date() });
});

// Catch-all for unknown API requests
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Fallback for non-API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

module.exports = app;
