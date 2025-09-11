import { Cloth } from '../models/Cloth.js';
import { Collection } from '../models/Collection.js';
import { User } from '../models/User.js';

// Query optimization utilities for MongoDB Atlas free tier

export class QueryOptimizer {
  // Optimized cloth queries
  static async getClothesByUser(userId, filters = {}, options = {}) {
    const {
      type,
      color,
      occasion,
      worn,
      needsCleaning,
      search,
      sortBy = 'lastWorn',
      sortOrder = 'desc',
      limit = 50,
      page = 1
    } = { ...filters, ...options };

    // Build filter object
    const filter = { userId };
    
    if (type) filter.type = { $regex: type, $options: 'i' };
    if (color) filter.color = { $regex: color, $options: 'i' };
    if (occasion) filter.occasion = { $regex: occasion, $options: 'i' };
    if (worn !== undefined) filter.worn = worn;
    if (needsCleaning !== undefined) filter.needsCleaning = needsCleaning;
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'lastWorn') {
      sort.lastWorn = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'createdAt') {
      sort.createdAt = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'desc' ? -1 : 1;
    }

    // Add secondary sort
    if (sortBy !== 'lastWorn') {
      sort.lastWorn = -1;
    }
    if (sortBy !== 'createdAt') {
      sort.createdAt = -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      Cloth.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Cloth.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Optimized collection queries
  static async getCollectionsByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'lastUpdated',
      sortOrder = -1
    } = options;

    const skip = (page - 1) * limit;
    
    const [collections, total] = await Promise.all([
      Collection.find({ ownerId: userId, isActive: true })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Collection.countDocuments({ ownerId: userId, isActive: true })
    ]);

    return {
      collections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get collection with populated items
  static async getCollectionWithItems(collectionId, userId) {
    const collection = await Collection.findOne({
      _id: collectionId,
      ownerId: userId,
      isActive: true
    }).lean();

    if (!collection) {
      return null;
    }

    // Get items in batches to avoid large queries
    const batchSize = 50;
    const items = [];
    
    for (let i = 0; i < collection.itemIds.length; i += batchSize) {
      const batch = collection.itemIds.slice(i, i + batchSize);
      const batchItems = await Cloth.find({
        _id: { $in: batch },
        userId: userId
      }).lean();
      
      items.push(...batchItems);
    }

    return {
      ...collection,
      items
    };
  }

  // Search across multiple collections
  static async searchClothes(userId, searchTerm, options = {}) {
    const {
      limit = 20,
      page = 1,
      filters = {}
    } = options;

    const skip = (page - 1) * limit;
    
    // Use text search for better performance
    const searchFilter = {
      userId,
      $text: { $search: searchTerm },
      ...filters
    };

    const [items, total] = await Promise.all([
      Cloth.find(searchFilter)
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean(),
      Cloth.countDocuments(searchFilter)
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user statistics efficiently
  static async getUserStats(userId) {
    const [
      clothCount,
      collectionCount,
      wornCount,
      needsCleaningCount
    ] = await Promise.all([
      Cloth.countDocuments({ userId }),
      Collection.countDocuments({ ownerId: userId, isActive: true }),
      Cloth.countDocuments({ userId, worn: true }),
      Cloth.countDocuments({ userId, needsCleaning: true })
    ]);

    return {
      clothCount,
      collectionCount,
      wornCount,
      needsCleaningCount
    };
  }

  // Batch operations for better performance
  static async batchUpdateClothes(updates) {
    const operations = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: { ...update, updatedAt: new Date() } }
      }
    }));

    return await Cloth.bulkWrite(operations);
  }

  // Get recently accessed items
  static async getRecentlyAccessed(userId, limit = 20) {
    return await Cloth.find({ userId })
      .sort({ 'metadata.lastAccessed': -1 })
      .limit(limit)
      .lean();
  }

  // Get popular items (most accessed)
  static async getPopularItems(userId, limit = 20) {
    return await Cloth.find({ userId })
      .sort({ 'metadata.accessCount': -1 })
      .limit(limit)
      .lean();
  }

  // Get storage usage statistics
  static async getStorageStats(userId) {
    const pipeline = [
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$metadata.fileSize' },
          count: { $sum: 1 },
          avgSize: { $avg: '$metadata.fileSize' }
        }
      }
    ];

    const [stats] = await Cloth.aggregate(pipeline);
    
    return {
      totalSize: stats?.totalSize || 0,
      totalSizeMB: Math.round((stats?.totalSize || 0) / 1024 / 1024),
      count: stats?.count || 0,
      avgSize: Math.round(stats?.avgSize || 0)
    };
  }

  // Similarity search using simple cosine similarity on stored embeddings
  // NOTE: Runs in app layer to avoid server-side heavy compute; keep k small
  static async findSimilarClothes(userId, clothId, k = 10) {
    const base = await Cloth.findOne({ _id: clothId, userId }).select('+embedding');
    if (!base?.embedding || !Array.isArray(base.embedding) || base.embedding.length === 0) {
      return [];
    }

    const candidates = await Cloth.find({ userId, _id: { $ne: clothId } })
      .select('name type color occasion imageUrl embedding')
      .limit(500) // cap to keep compute small on free tier
      .lean();

    const dot = (a, b) => a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
    const norm = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const baseNorm = norm(base.embedding);

    const scored = candidates
      .filter(c => Array.isArray(c.embedding) && c.embedding.length === base.embedding.length)
      .map(c => {
        const score = dot(base.embedding, c.embedding) / (baseNorm * norm(c.embedding) || 1);
        return { ...c, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ embedding, ...rest }) => rest);

    return scored;
  }

  // Cleanup old/unused data
  static async cleanupOldData(userId, daysOld = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Cloth.deleteMany({
      userId,
      'metadata.lastAccessed': { $lt: cutoffDate },
      worn: false
    });

    return result.deletedCount;
  }
}

export default QueryOptimizer;
