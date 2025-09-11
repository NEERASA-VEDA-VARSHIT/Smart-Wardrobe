import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/production.js';

// Import models
import { User } from '../models/User.js';
import { Cloth } from '../models/Cloth.js';
import { Outfit } from '../models/Outfit.js';
import { Collection } from '../models/Collection.js';

const seedData = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ Connected to database');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Cloth.deleteMany({});
    await Outfit.deleteMany({});
    await Collection.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create test users
    console.log('👥 Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const user1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    });

    const user2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    });

    const user3 = await User.create({
      name: 'Carol Davis',
      email: 'carol@example.com',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    });

    console.log('✅ Test users created');

    // Create sample clothes for Alice
    console.log('👕 Creating sample clothes...');
    const sampleClothes = [
      {
        name: 'Blue Denim Jeans',
        type: 'pants',
        color: 'Blue',
        occasion: 'casual',
        imageUrl: '/uploads/sample-jeans.jpg',
        owner: user1._id,
        worn: false,
        needsCleaning: false
      },
      {
        name: 'White Cotton T-Shirt',
        type: 'shirt',
        color: 'White',
        occasion: 'casual',
        imageUrl: '/uploads/sample-tshirt.jpg',
        owner: user1._id,
        worn: false,
        needsCleaning: false
      },
      {
        name: 'Black Blazer',
        type: 'jacket',
        color: 'Black',
        occasion: 'formal',
        imageUrl: '/uploads/sample-blazer.jpg',
        owner: user1._id,
        worn: false,
        needsCleaning: false
      },
      {
        name: 'Red Summer Dress',
        type: 'dress',
        color: 'Red',
        occasion: 'party',
        imageUrl: '/uploads/sample-dress.jpg',
        owner: user1._id,
        worn: false,
        needsCleaning: false
      },
      {
        name: 'White Sneakers',
        type: 'shoes',
        color: 'White',
        occasion: 'casual',
        imageUrl: '/uploads/sample-sneakers.jpg',
        owner: user1._id,
        worn: false,
        needsCleaning: false
      },
      {
        name: 'Black Leather Jacket',
        type: 'jacket',
        color: 'Black',
        occasion: 'casual',
        imageUrl: '/uploads/sample-leather-jacket.jpg',
        owner: user1._id,
        worn: true,
        needsCleaning: true
      },
      {
        name: 'Navy Blue Chinos',
        type: 'pants',
        color: 'Navy',
        occasion: 'business',
        imageUrl: '/uploads/sample-chinos.jpg',
        owner: user1._id,
        worn: false,
        needsCleaning: false
      },
      {
        name: 'Gray Sweater',
        type: 'shirt',
        color: 'Gray',
        occasion: 'casual',
        imageUrl: '/uploads/sample-sweater.jpg',
        owner: user1._id,
        worn: false,
        needsCleaning: false
      }
    ];

    const createdClothes = await Cloth.insertMany(sampleClothes);
    console.log('✅ Sample clothes created');

    // Create sample outfits
    console.log('👔 Creating sample outfits...');
    const sampleOutfits = [
      {
        name: 'Casual Friday Look',
        items: [createdClothes[0]._id, createdClothes[1]._id, createdClothes[4]._id],
        occasion: 'casual',
        owner: user1._id
      },
      {
        name: 'Business Meeting',
        items: [createdClothes[2]._id, createdClothes[6]._id],
        occasion: 'business',
        owner: user1._id
      },
      {
        name: 'Date Night',
        items: [createdClothes[3]._id, createdClothes[4]._id],
        occasion: 'date',
        owner: user1._id
      }
    ];

    await Outfit.insertMany(sampleOutfits);
    console.log('✅ Sample outfits created');

    // Create sample collections
    console.log('📁 Creating sample collections...');
    const sampleCollections = [
      {
        name: 'Work Wardrobe',
        description: 'Professional clothes for office and meetings',
        items: [createdClothes[2]._id, createdClothes[6]._id],
        owner: user1._id,
        isPublic: false
      },
      {
        name: 'Casual Weekend',
        description: 'Comfortable clothes for relaxing',
        items: [createdClothes[0]._id, createdClothes[1]._id, createdClothes[7]._id],
        owner: user1._id,
        isPublic: true
      },
      {
        name: 'Party Collection',
        description: 'Fun outfits for special occasions',
        items: [createdClothes[3]._id, createdClothes[5]._id],
        owner: user1._id,
        isPublic: true
      }
    ];

    await Collection.insertMany(sampleCollections);
    console.log('✅ Sample collections created');

    // Create some clothes for other users
    const otherClothes = [
      {
        name: 'Green Hoodie',
        type: 'shirt',
        color: 'Green',
        occasion: 'casual',
        imageUrl: '/uploads/sample-hoodie.jpg',
        owner: user2._id,
        worn: false,
        needsCleaning: false
      },
      {
        name: 'Black Dress Pants',
        type: 'pants',
        color: 'Black',
        occasion: 'formal',
        imageUrl: '/uploads/sample-dress-pants.jpg',
        owner: user3._id,
        worn: false,
        needsCleaning: false
      }
    ];

    await Cloth.insertMany(otherClothes);
    console.log('✅ Additional user clothes created');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: 3`);
    console.log(`👕 Clothes: ${createdClothes.length + otherClothes.length}`);
    console.log(`👔 Outfits: ${sampleOutfits.length}`);
    console.log(`📁 Collections: ${sampleCollections.length}`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('alice@example.com / password123');
    console.log('bob@example.com / password123');
    console.log('carol@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export default seedData;
