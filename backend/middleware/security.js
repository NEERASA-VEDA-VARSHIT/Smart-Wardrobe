import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import config from '../config/production.js';

// Rate limiting
export const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message,
        type: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// General rate limit (100 requests/min by default)
export const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        type: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Strict rate limit for auth endpoints
export const authRateLimit = createRateLimit(
  process.env.NODE_ENV === 'development' ? 60 * 1000 : 15 * 60 * 1000,
  process.env.NODE_ENV === 'development' ? 50 : 5,
  'Too many authentication attempts, please try again later.'
);

// Upload rate limit
export const uploadRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Upload limit exceeded, please try again later.'
);

// Helmet security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: config.security.helmet.contentSecurityPolicy,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
export const corsOptions = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Development origins
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    // Production origins from config
    const allowedOrigins = config.server.cors.origin || devOrigins;
    
    // Combine and check
    const allAllowedOrigins = [...devOrigins, ...allowedOrigins];
    
    if (allAllowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allAllowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// Request size limiter
export const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: {
        message: 'Request entity too large',
        type: 'PAYLOAD_TOO_LARGE',
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

// IP whitelist (for admin endpoints)
export const ipWhitelist = (allowedIPs = []) => (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Access denied from this IP address',
        type: 'IP_NOT_ALLOWED',
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

// Request logging for security monitoring
export const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /onload/i,
    /onerror/i,
    /<.*>/,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i
  ];

  const checkSuspicious = (obj, path = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (typeof value === 'string') {
          for (const pattern of suspiciousPatterns) {
            if (pattern.test(value)) {
              console.warn(`Suspicious input detected at ${currentPath}:`, value);
              // Log to security monitoring system
              break;
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          checkSuspicious(value, currentPath);
        }
      }
    }
  };

  // Check request body, query, and params (safely)
  if (req.body) checkSuspicious(req.body, 'body');
  if (req.query) checkSuspicious(req.query, 'query');
  if (req.params) checkSuspicious(req.params, 'params');

  next();
};

// File upload security
export const fileUploadSecurity = (req, res, next) => {
  if (req.file) {
    // Check file type
    const allowedTypes = config.upload.allowedTypes;
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          type: 'INVALID_FILE_TYPE',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check file size
    if (req.file.size > config.upload.maxFileSize) {
      return res.status(400).json({
        success: false,
        error: {
          message: `File too large. Maximum size: ${config.upload.maxFileSize / (1024 * 1024)}MB`,
          type: 'FILE_TOO_LARGE',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check for malicious file content
    const buffer = req.file.buffer;
    const fileHeader = buffer.toString('hex', 0, 4);
    
    // Check for common image file signatures
    const imageSignatures = {
      'ffd8ffe0': 'jpeg',
      'ffd8ffe1': 'jpeg',
      'ffd8ffe2': 'jpeg',
      '89504e47': 'png',
      '47494638': 'gif',
      '52494646': 'webp'
    };

    if (!imageSignatures[fileHeader]) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid image file format',
          type: 'INVALID_IMAGE_FORMAT',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  next();
};

// API key validation (for external integrations)
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or missing API key',
        type: 'INVALID_API_KEY',
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

// Session security
export const sessionSecurity = (req, res, next) => {
  // Prevent session fixation
  if (req.session && !req.session.isNew) {
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      }
    });
  }

  next();
};
