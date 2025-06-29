const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const s3Routes = require('./src/routes/s3Routes');
const taskRoutes = require('./src/routes/taskRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const rewardRoutes = require('./src/routes/rewardRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

// Import daily reset job
const { initializeDailyResetJob } = require('./src/jobs/dailyResetJob');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    '*',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CORS_ORIGIN || 'http://localhost:3000'
  ],
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically (for development)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker')
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database URL:', process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Add API request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/s3', s3Routes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize daily reset job
  try {
    initializeDailyResetJob();
    console.log('✅ Daily reset system initialized');
  } catch (error) {
    console.error('❌ Failed to initialize daily reset system:', error);
  }
});

module.exports = app;
