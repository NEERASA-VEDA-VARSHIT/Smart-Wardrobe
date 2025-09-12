import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const RAW_MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

function appendDbIfMissing(uri, dbName) {
  if (!dbName) return uri;
  // If URI already contains a path segment (database name), return as-is
  // Matches ...mongodb.net/<something> or mongodb://host:port/<something>
  const hasDbPath = /mongodb(?:\+srv)?:\/\/.+\/[^?]+/.test(uri);
  if (hasDbPath) return uri;

  // Insert /<dbName> before the query string if present
  const qIndex = uri.indexOf('?');
  if (qIndex === -1) {
    return uri.endsWith('/') ? `${uri}${dbName}` : `${uri}/${dbName}`;
  }
  const base = uri.slice(0, qIndex);
  const query = uri.slice(qIndex); // includes '?'
  return base.endsWith('/') ? `${base}${dbName}${query}` : `${base}/${dbName}${query}`;
}

const MONGODB_URI = appendDbIfMissing(RAW_MONGODB_URI, MONGODB_DB);

// Connection options optimized for free tier
const connectionOptions = {
  // Connection pooling
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2,  // Minimum number of connections in the pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take
  
  // Performance optimizations
  // useNewUrlParser: true, // Deprecated in newer versions
  // useUnifiedTopology: true, // Deprecated in newer versions
  
  // Write concern for better performance
  writeConcern: {
    w: 1, // Acknowledge writes
    j: false, // Don't wait for journal
    wtimeout: 1000 // 1 second timeout
  },
  
  // Read preference for better performance
  readPreference: 'primaryPreferred',
  
  // Compression
  compressors: ['zlib'],
  zlibCompressionLevel: 6,
  
  // Connection retry
  retryWrites: true,
  retryReads: true,
  
  // SSL/TLS configuration for Atlas
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  
  // Connection timeout and retry
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000
};

// Connection state tracking
let isConnected = false;
let connectionPromise = null;

// Optimized connection function
export const connectDB = async () => {
  // Disable mongoose buffering globally per free-tier guidance
  mongoose.set('bufferCommands', false);

  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(MONGODB_URI, connectionOptions)
    .then(() => {
      isConnected = true;
      console.log('✅ MongoDB connected successfully');
      
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });

      return mongoose.connection;
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error);
      isConnected = false;
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    if (!isConnected) {
      return { status: 'disconnected', message: 'Database not connected' };
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();
    
    // Get connection stats
    const stats = await mongoose.connection.db.stats();
    
    return {
      status: 'connected',
      message: 'Database is healthy',
      stats: {
        collections: stats.collections,
        dataSize: Math.round(stats.dataSize / 1024 / 1024), // MB
        storageSize: Math.round(stats.storageSize / 1024 / 1024), // MB
        indexes: stats.indexes,
        objects: stats.objects
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      error: error
    };
  }
};

// Query optimization utilities
export const optimizeQuery = (query, options = {}) => {
  const { 
    limit = 50, 
    skip = 0, 
    sort = { createdAt: -1 },
    select = null,
    populate = null
  } = options;

  let optimizedQuery = query.limit(limit).skip(skip).sort(sort);
  
  if (select) {
    optimizedQuery = optimizedQuery.select(select);
  }
  
  if (populate) {
    optimizedQuery = optimizedQuery.populate(populate);
  }
  
  return optimizedQuery.lean(); // Use lean() for better performance
};

// Batch operations utility
export const batchOperation = async (operations, batchSize = 100) => {
  const results = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch);
    results.push(...batchResults);
  }
  
  return results;
};

// Connection monitoring
export const getConnectionStats = () => {
  const connection = mongoose.connection;
  
  return {
    readyState: connection.readyState,
    host: connection.host,
    port: connection.port,
    name: connection.name,
    isConnected: isConnected,
    collections: Object.keys(connection.collections).length
  };
};

export default {
  connectDB,
  checkDatabaseHealth,
  optimizeQuery,
  batchOperation,
  getConnectionStats
};
