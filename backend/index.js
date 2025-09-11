import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './config/database.js';
import config from './config/production.js';
import clothesRoutes from './routes/clothesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import sharesRoutes from './routes/sharesRoutes.js';
import sharedRoutes from './routes/sharedRoutes.js';
import wardrobeRoutes from './routes/wardrobeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import outfitSuggestionRoutes from './routes/outfitSuggestionRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';

// Import production middleware
import { 
  errorHandler, 
  notFound, 
  requestLogger 
} from './middleware/errorHandler.js';
import { 
  securityHeaders, 
  corsOptions, 
  generalRateLimit,
  authRateLimit,
  uploadRateLimit,
  requestSizeLimit,
  fileUploadSecurity,
  securityLogger
} from './middleware/security.js';
import { sanitizeInput } from './middleware/validation.js';
import { 
  requestMonitoring, 
  errorMonitoring, 
  healthCheck, 
  metricsEndpoint 
} from './middleware/monitoring.js';

const app = express();

// Security middleware (order matters!)
app.use(securityHeaders);
app.use(corsOptions);
app.use(requestSizeLimit);
app.use(securityLogger);
app.use(sanitizeInput);

// Rate limiting
app.use(generalRateLimit);
app.use('/auth', authRateLimit);
// Upload rate limit will be applied per-route in clothesRoutes for POST/PUT only

// Body parsing
app.use(express.json({ 
  limit: config.upload.maxFileSize,
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.upload.maxFileSize 
}));

// Request logging and monitoring
app.use(requestLogger);
app.use(requestMonitoring);

// File upload security
app.use(fileUploadSecurity);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', healthCheck);

// Metrics endpoint
app.get('/metrics', metricsEndpoint);

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Smart Wardrobe API',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.env,
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/auth',
      clothes: '/clothes',
      wardrobe: '/wardrobe',
      recommendations: '/recommendations',
      suggestions: '/suggestions',
      collections: '/collections'
    }
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/clothes', clothesRoutes);
app.use('/shares', sharesRoutes);
app.use('/shared', sharedRoutes);
app.use('/wardrobe', wardrobeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/recommendations', recommendationRoutes);
app.use('/suggestions', outfitSuggestionRoutes);
app.use('/collections', collectionRoutes);

// 404 handler
app.use(notFound);

// Error monitoring and global error handler
app.use(errorMonitoring);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server after connecting DB
(async () => {
  try {
    console.log('🚀 Starting Smart Wardrobe API...');
    console.log(`Environment: ${config.server.env}`);
    
    console.log('📡 Connecting to database...');
    await connectDB(config.mongodb.uri);
    console.log('✅ Database connected successfully');
    
    console.log('🔒 Security middleware loaded');
    console.log('📊 Request logging enabled');
    console.log('🛡️ Rate limiting configured');
    
    console.log('🌐 Starting server...');
    app.listen(config.server.port, () => {
      console.log(`✅ API running on http://localhost:${config.server.port}`);
      console.log(`📋 Health check: http://localhost:${config.server.port}/health`);
      console.log(`📚 API docs: http://localhost:${config.server.port}/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
