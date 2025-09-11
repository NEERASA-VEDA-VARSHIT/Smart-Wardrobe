import NodeCache from 'node-cache';

// Create cache instances
const cache = new NodeCache({ 
  stdTTL: 600, // 10 minutes default
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Better performance
});

// Cache configurations for different data types
const cacheConfigs = {
  user: { ttl: 1800 }, // 30 minutes
  clothes: { ttl: 600 }, // 10 minutes
  outfits: { ttl: 900 }, // 15 minutes
  recommendations: { ttl: 300 }, // 5 minutes
  collections: { ttl: 1200 }, // 20 minutes
  suggestions: { ttl: 600 }, // 10 minutes
  static: { ttl: 3600 } // 1 hour
};

// Cache key generators
export const cacheKeys = {
  user: (id) => `user:${id}`,
  userClothes: (userId) => `clothes:user:${userId}`,
  userOutfits: (userId) => `outfits:user:${userId}`,
  userRecommendations: (userId, filters = '') => `recommendations:user:${userId}:${filters}`,
  userCollections: (userId) => `collections:user:${userId}`,
  userSuggestions: (userId, status = '') => `suggestions:user:${userId}:${status}`,
  collection: (id) => `collection:${id}`,
  share: (token) => `share:${token}`,
  wardrobeStats: (userId) => `stats:wardrobe:${userId}`
};

// Cache middleware factory
export const createCacheMiddleware = (keyGenerator, config = {}) => {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const ttl = config.ttl || cacheConfigs.static.ttl;
    
    // Try to get from cache
    const cached = cache.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }
    
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl);
        res.set('X-Cache', 'MISS');
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Cache invalidation helpers
export const invalidateCache = {
  user: (userId) => {
    const patterns = [
      cacheKeys.user(userId),
      cacheKeys.userClothes(userId),
      cacheKeys.userOutfits(userId),
      cacheKeys.userRecommendations(userId),
      cacheKeys.userCollections(userId),
      cacheKeys.userSuggestions(userId),
      cacheKeys.wardrobeStats(userId)
    ];
    
    patterns.forEach(pattern => {
      cache.del(pattern);
    });
  },
  
  clothes: (userId) => {
    cache.del(cacheKeys.userClothes(userId));
    cache.del(cacheKeys.userRecommendations(userId));
    cache.del(cacheKeys.wardrobeStats(userId));
  },
  
  outfits: (userId) => {
    cache.del(cacheKeys.userOutfits(userId));
    cache.del(cacheKeys.wardrobeStats(userId));
  },
  
  collections: (userId) => {
    cache.del(cacheKeys.userCollections(userId));
  },
  
  suggestions: (userId) => {
    cache.del(cacheKeys.userSuggestions(userId));
  },
  
  collection: (collectionId) => {
    cache.del(cacheKeys.collection(collectionId));
  },
  
  share: (token) => {
    cache.del(cacheKeys.share(token));
  }
};

// Cache statistics
export const getCacheStats = () => {
  const stats = cache.getStats();
  return {
    keys: stats.keys,
    hits: stats.hits,
    misses: stats.misses,
    hitRate: stats.hits / (stats.hits + stats.misses) || 0,
    memoryUsage: process.memoryUsage()
  };
};

// Clear all cache
export const clearCache = () => {
  cache.flushAll();
};

// Cache warming function
export const warmCache = async (userId, dataLoaders) => {
  try {
    // Pre-load frequently accessed data
    const promises = [
      dataLoaders.loadUser?.(userId),
      dataLoaders.loadClothes?.(userId),
      dataLoaders.loadOutfits?.(userId),
      dataLoaders.loadCollections?.(userId)
    ].filter(Boolean);
    
    await Promise.all(promises);
    console.log(`Cache warmed for user ${userId}`);
  } catch (error) {
    console.error('Cache warming failed:', error);
  }
};

// Cache middleware for specific routes
export const cacheMiddleware = {
  // User data cache
  userData: createCacheMiddleware(
    (req) => cacheKeys.user(req.user?.id),
    cacheConfigs.user
  ),
  
  // Clothes cache
  userClothes: createCacheMiddleware(
    (req) => cacheKeys.userClothes(req.user?.id),
    cacheConfigs.clothes
  ),
  
  // Outfits cache
  userOutfits: createCacheMiddleware(
    (req) => cacheKeys.userOutfits(req.user?.id),
    cacheConfigs.outfits
  ),
  
  // Recommendations cache
  recommendations: createCacheMiddleware(
    (req) => {
      const filters = JSON.stringify(req.query);
      return cacheKeys.userRecommendations(req.user?.id, filters);
    },
    cacheConfigs.recommendations
  ),
  
  // Collections cache
  userCollections: createCacheMiddleware(
    (req) => cacheKeys.userCollections(req.user?.id),
    cacheConfigs.collections
  ),
  
  // Static data cache
  static: createCacheMiddleware(
    (req) => `static:${req.originalUrl}`,
    cacheConfigs.static
  )
};

export default cache;
