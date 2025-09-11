import mongoose from 'mongoose';
import config from '../config/production.js';

// Import models to ensure they're registered
import { User } from '../models/User.js';
import { Cloth } from '../models/Cloth.js';
import { Outfit } from '../models/Outfit.js';
import { OutfitSuggestion } from '../models/OutfitSuggestion.js';
import { Collection } from '../models/Collection.js';
import { Share } from '../models/Share.js';
import { Notification } from '../models/Notification.js';

const createIndexes = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ Connected to database');

    console.log('📊 Creating database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('✅ User indexes created');

    // Cloth indexes
    await Cloth.collection.createIndex({ owner: 1 });
    await Cloth.collection.createIndex({ type: 1 });
    await Cloth.collection.createIndex({ color: 1 });
    await Cloth.collection.createIndex({ occasion: 1 });
    await Cloth.collection.createIndex({ worn: 1 });
    await Cloth.collection.createIndex({ needsCleaning: 1 });
    await Cloth.collection.createIndex({ createdAt: -1 });
    await Cloth.collection.createIndex({ owner: 1, type: 1 });
    await Cloth.collection.createIndex({ owner: 1, color: 1 });
    await Cloth.collection.createIndex({ owner: 1, occasion: 1 });
    await Cloth.collection.createIndex({ owner: 1, worn: 1, needsCleaning: 1 });
    console.log('✅ Cloth indexes created');

    // Outfit indexes
    await Outfit.collection.createIndex({ owner: 1 });
    await Outfit.collection.createIndex({ createdAt: -1 });
    await Outfit.collection.createIndex({ occasion: 1 });
    await Outfit.collection.createIndex({ owner: 1, occasion: 1 });
    console.log('✅ Outfit indexes created');

    // OutfitSuggestion indexes
    await OutfitSuggestion.collection.createIndex({ ownerId: 1 });
    await OutfitSuggestion.collection.createIndex({ stylistId: 1 });
    await OutfitSuggestion.collection.createIndex({ status: 1 });
    await OutfitSuggestion.collection.createIndex({ createdAt: -1 });
    await OutfitSuggestion.collection.createIndex({ ownerId: 1, status: 1 });
    await OutfitSuggestion.collection.createIndex({ stylistId: 1, status: 1 });
    console.log('✅ OutfitSuggestion indexes created');

    // Collection indexes
    await Collection.collection.createIndex({ owner: 1 });
    await Collection.collection.createIndex({ shareToken: 1 }, { unique: true, sparse: true });
    await Collection.collection.createIndex({ createdAt: -1 });
    await Collection.collection.createIndex({ name: 1 });
    console.log('✅ Collection indexes created');

    // Share indexes
    await Share.collection.createIndex({ ownerId: 1 });
    await Share.collection.createIndex({ viewerId: 1 });
    await Share.collection.createIndex({ shareToken: 1 }, { unique: true });
    await Share.collection.createIndex({ createdAt: -1 });
    await Share.collection.createIndex({ ownerId: 1, viewerId: 1 });
    console.log('✅ Share indexes created');

    // Notification indexes
    await Notification.collection.createIndex({ userId: 1 });
    await Notification.collection.createIndex({ read: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });
    await Notification.collection.createIndex({ userId: 1, read: 1 });
    console.log('✅ Notification indexes created');

    // Text search indexes
    await Cloth.collection.createIndex({ 
      name: 'text', 
      type: 'text', 
      color: 'text', 
      occasion: 'text' 
    });
    await Outfit.collection.createIndex({ 
      name: 'text', 
      occasion: 'text' 
    });
    await Collection.collection.createIndex({ 
      name: 'text', 
      description: 'text' 
    });
    console.log('✅ Text search indexes created');

    console.log('🎉 All indexes created successfully!');
    
    // Show index statistics
    const collections = ['users', 'clothes', 'outfits', 'outfitsuggestions', 'collections', 'shares', 'notifications'];
    for (const collectionName of collections) {
      const indexes = await mongoose.connection.db.collection(collectionName).indexes();
      console.log(`📋 ${collectionName}: ${indexes.length} indexes`);
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createIndexes();
}

export default createIndexes;
