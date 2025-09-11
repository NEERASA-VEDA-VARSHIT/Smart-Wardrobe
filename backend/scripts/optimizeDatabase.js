import mongoose from 'mongoose';
import { connectDB, checkDatabaseHealth } from '../config/database.js';
import { Cloth } from '../models/Cloth.js';
import { Collection } from '../models/Collection.js';
import { User } from '../models/User.js';

// Database optimization script
const optimizeDatabase = async () => {
  try {
    console.log('🚀 Starting database optimization...');
    
    // Connect to database
    await connectDB();
    
    // Check current health
    const health = await checkDatabaseHealth();
    console.log('📊 Current database health:', health);
    
    // 1. Create indexes
    console.log('\n📋 Creating indexes...');
    await createIndexes();
    
    // 2. Optimize collections
    console.log('\n🔧 Optimizing collections...');
    await optimizeCollections();
    
    // 3. Clean up orphaned data
    console.log('\n🧹 Cleaning up orphaned data...');
    await cleanupOrphanedData();
    
    // 4. Update statistics
    console.log('\n📈 Updating statistics...');
    await updateStatistics();
    
    // Final health check
    const finalHealth = await checkDatabaseHealth();
    console.log('\n✅ Final database health:', finalHealth);
    
    console.log('\n🎉 Database optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Create all necessary indexes
const createIndexes = async () => {
  const indexes = [
    // Cloth indexes
    { model: Cloth, index: { userId: 1, lastWorn: -1 } },
    { model: Cloth, index: { userId: 1, type: 1 } },
    { model: Cloth, index: { userId: 1, color: 1 } },
    { model: Cloth, index: { userId: 1, occasion: 1 } },
    { model: Cloth, index: { userId: 1, worn: 1 } },
    { model: Cloth, index: { userId: 1, needsCleaning: 1 } },
    { model: Cloth, index: { userId: 1, tags: 1 } },
    { model: Cloth, index: { 'sharedWith.userId': 1 } },
    { model: Cloth, index: { createdAt: -1 } },
    { model: Cloth, index: { 'metadata.lastAccessed': -1 } },
    { model: Cloth, index: { userId: 1, type: 1, color: 1 } },
    { model: Cloth, index: { userId: 1, worn: 1, lastWorn: -1 } },
    { model: Cloth, index: { userId: 1, needsCleaning: 1, lastWorn: -1 } },
    
    // Collection indexes
    { model: Collection, index: { ownerId: 1, name: 1 }, options: { unique: true } },
    { model: Collection, index: { ownerId: 1, isActive: 1 } },
    { model: Collection, index: { shareToken: 1 } },
    { model: Collection, index: { 'invitedEmails': 1 } },
    { model: Collection, index: { lastUpdated: -1 } },
    { model: Collection, index: { lastAccessed: -1 } },
    { model: Collection, index: { isPublic: 1, isActive: 1 } },
    { model: Collection, index: { itemCount: -1 } },
    
    // User indexes
    { model: User, index: { email: 1 }, options: { unique: true } },
    { model: User, index: { isActive: 1 } },
    { model: User, index: { createdAt: -1 } }
  ];
  
  for (const { model, index, options = {} } of indexes) {
    try {
      await model.collection.createIndex(index, options);
      console.log(`✅ Created index for ${model.modelName}:`, index);
    } catch (error) {
      if (error.code === 85) { // Index already exists
        console.log(`ℹ️  Index already exists for ${model.modelName}:`, index);
      } else {
        console.error(`❌ Failed to create index for ${model.modelName}:`, error.message);
      }
    }
  }
};

// Optimize collections
const optimizeCollections = async () => {
  // Update collection item counts
  const collections = await Collection.find({});
  for (const collection of collections) {
    collection.itemCount = collection.itemIds.length;
    collection.lastUpdated = new Date();
    await collection.save();
  }
  console.log(`✅ Updated ${collections.length} collections`);
  
  // Update cloth metadata
  const clothes = await Cloth.find({});
  for (const cloth of clothes) {
    if (!cloth.metadata) {
      cloth.metadata = {
        fileSize: 0,
        uploadDate: cloth.createdAt,
        lastAccessed: cloth.createdAt
      };
      await cloth.save();
    }
  }
  console.log(`✅ Updated ${clothes.length} clothes metadata`);
};

// Clean up orphaned data
const cleanupOrphanedData = async () => {
  // Find collections with invalid item references
  const collections = await Collection.find({});
  let cleanedCollections = 0;
  
  for (const collection of collections) {
    const validItemIds = [];
    
    for (const itemId of collection.itemIds) {
      const cloth = await Cloth.findById(itemId);
      if (cloth) {
        validItemIds.push(itemId);
      }
    }
    
    if (validItemIds.length !== collection.itemIds.length) {
      collection.itemIds = validItemIds;
      collection.itemCount = validItemIds.length;
      await collection.save();
      cleanedCollections++;
    }
  }
  
  console.log(`✅ Cleaned up ${cleanedCollections} collections with orphaned items`);
  
  // Find clothes with invalid user references
  const clothes = await Cloth.find({});
  let cleanedClothes = 0;
  
  for (const cloth of clothes) {
    const user = await User.findById(cloth.userId);
    if (!user) {
      await Cloth.findByIdAndDelete(cloth._id);
      cleanedClothes++;
    }
  }
  
  console.log(`✅ Cleaned up ${cleanedClothes} clothes with invalid user references`);
};

// Update statistics
const updateStatistics = async () => {
  const stats = {
    users: await User.countDocuments({ isActive: true }),
    clothes: await Cloth.countDocuments(),
    collections: await Collection.countDocuments({ isActive: true }),
    totalStorage: 0
  };
  
  // Calculate approximate storage usage
  const clothes = await Cloth.find({}).select('metadata.fileSize');
  stats.totalStorage = clothes.reduce((sum, cloth) => sum + (cloth.metadata?.fileSize || 0), 0);
  
  console.log('📊 Database statistics:', {
    ...stats,
    totalStorageMB: Math.round(stats.totalStorage / 1024 / 1024)
  });
};

// Run optimization
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeDatabase();
}

export default optimizeDatabase;
