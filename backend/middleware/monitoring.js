import { logger } from './errorHandler.js';

// Performance metrics
const metrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    byEndpoint: new Map(),
    byMethod: new Map(),
    responseTimes: []
  },
  errors: {
    total: 0,
    byType: new Map(),
    byEndpoint: new Map()
  },
  database: {
    queries: 0,
    slowQueries: 0,
    connectionPool: {
      active: 0,
      idle: 0,
      total: 0
    }
  },
  memory: {
    heapUsed: 0,
    heapTotal: 0,
    external: 0,
    rss: 0
  },
  uptime: {
    startTime: Date.now(),
    lastRestart: Date.now()
  }
};

// Request monitoring middleware
export const requestMonitoring = (req, res, next) => {
  const startTime = Date.now();
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  
  // Increment request counters
  metrics.requests.total++;
  
  // Track by endpoint
  const endpointCount = metrics.requests.byEndpoint.get(endpoint) || 0;
  metrics.requests.byEndpoint.set(endpoint, endpointCount + 1);
  
  // Track by method
  const methodCount = metrics.requests.byMethod.get(req.method) || 0;
  metrics.requests.byMethod.set(req.method, methodCount + 1);
  
  // Override res.end to capture response time and status
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Track response time
    metrics.requests.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times for memory efficiency
    if (metrics.requests.responseTimes.length > 1000) {
      metrics.requests.responseTimes = metrics.requests.responseTimes.slice(-1000);
    }
    
    // Track success/failure
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.successful++;
    } else {
      metrics.requests.failed++;
    }
    
    // Log slow requests
    if (responseTime > 1000) { // 1 second
      logger.warn('Slow request detected', {
        endpoint,
        responseTime,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }
    
    // Log request
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Error monitoring middleware
export const errorMonitoring = (error, req, res, next) => {
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  
  // Increment error counters
  metrics.errors.total++;
  
  // Track by error type
  const errorType = error.constructor.name || 'UnknownError';
  const typeCount = metrics.errors.byType.get(errorType) || 0;
  metrics.errors.byType.set(errorType, typeCount + 1);
  
  // Track by endpoint
  const endpointErrorCount = metrics.errors.byEndpoint.get(endpoint) || 0;
  metrics.errors.byEndpoint.set(endpoint, endpointErrorCount + 1);
  
  // Log error with context
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    endpoint,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  next(error);
};

// Database monitoring
export const databaseMonitoring = {
  trackQuery: (query, duration) => {
    metrics.database.queries++;
    
    if (duration > 100) { // 100ms threshold for slow queries
      metrics.database.slowQueries++;
      logger.warn('Slow database query detected', {
        query: query.toString(),
        duration,
        collection: query.collection?.name
      });
    }
  },
  
  updateConnectionPool: (poolStats) => {
    metrics.database.connectionPool = {
      active: poolStats.active || 0,
      idle: poolStats.idle || 0,
      total: poolStats.total || 0
    };
  }
};

// Memory monitoring
export const memoryMonitoring = () => {
  const memUsage = process.memoryUsage();
  metrics.memory = {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    external: Math.round(memUsage.external / 1024 / 1024), // MB
    rss: Math.round(memUsage.rss / 1024 / 1024) // MB
  };
  
  // Log memory warning if usage is high
  if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
    logger.warn('High memory usage detected', {
      heapUsed: metrics.memory.heapUsed,
      heapTotal: metrics.memory.heapTotal,
      rss: metrics.memory.rss
    });
  }
};

// Health check with detailed metrics
export const healthCheck = (req, res) => {
  // Update memory metrics
  memoryMonitoring();
  
  const uptime = Date.now() - metrics.uptime.startTime;
  const avgResponseTime = metrics.requests.responseTimes.length > 0
    ? metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / metrics.requests.responseTimes.length
    : 0;
  
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(uptime / 1000), // seconds
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    metrics: {
      requests: {
        total: metrics.requests.total,
        successful: metrics.requests.successful,
        failed: metrics.requests.failed,
        successRate: metrics.requests.total > 0 
          ? Math.round((metrics.requests.successful / metrics.requests.total) * 100) 
          : 0,
        averageResponseTime: Math.round(avgResponseTime),
        byMethod: Object.fromEntries(metrics.requests.byMethod),
        byEndpoint: Object.fromEntries(metrics.requests.byEndpoint)
      },
      errors: {
        total: metrics.errors.total,
        byType: Object.fromEntries(metrics.errors.byType),
        byEndpoint: Object.fromEntries(metrics.errors.byEndpoint)
      },
      database: {
        ...metrics.database,
        slowQueryRate: metrics.database.queries > 0 
          ? Math.round((metrics.database.slowQueries / metrics.database.queries) * 100)
          : 0
      },
      memory: metrics.memory,
      system: {
        cpuUsage: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    }
  };
  
  // Determine health status
  const errorRate = metrics.requests.total > 0 
    ? (metrics.errors.total / metrics.requests.total) * 100 
    : 0;
  
  if (errorRate > 10 || metrics.memory.heapUsed > 1000) {
    healthData.status = 'degraded';
  }
  
  if (errorRate > 25 || metrics.memory.heapUsed > 2000) {
    healthData.status = 'unhealthy';
  }
  
  const statusCode = healthData.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthData);
};

// Metrics endpoint
export const metricsEndpoint = (req, res) => {
  memoryMonitoring();
  
  const uptime = Date.now() - metrics.uptime.startTime;
  const avgResponseTime = metrics.requests.responseTimes.length > 0
    ? metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / metrics.requests.responseTimes.length
    : 0;
  
  res.json({
    timestamp: new Date().toISOString(),
    uptime: Math.round(uptime / 1000),
    requests: {
      total: metrics.requests.total,
      successful: metrics.requests.successful,
      failed: metrics.requests.failed,
      successRate: metrics.requests.total > 0 
        ? Math.round((metrics.requests.successful / metrics.requests.total) * 100) 
        : 0,
      averageResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: calculatePercentile(metrics.requests.responseTimes, 95),
      p99ResponseTime: calculatePercentile(metrics.requests.responseTimes, 99),
      byMethod: Object.fromEntries(metrics.requests.byMethod),
      byEndpoint: Object.fromEntries(metrics.requests.byEndpoint)
    },
    errors: {
      total: metrics.errors.total,
      errorRate: metrics.requests.total > 0 
        ? Math.round((metrics.errors.total / metrics.requests.total) * 100)
        : 0,
      byType: Object.fromEntries(metrics.errors.byType),
      byEndpoint: Object.fromEntries(metrics.errors.byEndpoint)
    },
    database: metrics.database,
    memory: metrics.memory,
    system: {
      cpuUsage: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    }
  });
};

// Helper function to calculate percentiles
const calculatePercentile = (arr, percentile) => {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
};

// Reset metrics (useful for testing)
export const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    successful: 0,
    failed: 0,
    byEndpoint: new Map(),
    byMethod: new Map(),
    responseTimes: []
  };
  metrics.errors = {
    total: 0,
    byType: new Map(),
    byEndpoint: new Map()
  };
  metrics.database = {
    queries: 0,
    slowQueries: 0,
    connectionPool: {
      active: 0,
      idle: 0,
      total: 0
    }
  };
  metrics.uptime.lastRestart = Date.now();
};

// Start memory monitoring interval
setInterval(memoryMonitoring, 30000); // Every 30 seconds

export default {
  requestMonitoring,
  errorMonitoring,
  databaseMonitoring,
  healthCheck,
  metricsEndpoint,
  resetMetrics
};
