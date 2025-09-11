import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    ownerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100
    },
    description: { 
      type: String, 
      trim: true,
      maxlength: 500
    },
    // Store only item IDs to keep documents small
    itemIds: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Cloth', 
      required: true 
    }],
    // Metadata for optimization
    itemCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    
    // Sharing configuration
    shareToken: { 
      type: String, 
      index: true,
      unique: true,
      sparse: true
    },
    invitedEmails: [{ 
      type: String, 
      trim: true,
      maxlength: 100
    }],
    permissions: {
      type: String,
      enum: ['viewer', 'stylist'],
      default: 'stylist'
    },
    
    // Access tracking
    accessCount: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    
    // Status tracking
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: false }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Strategic indexes for optimal performance
collectionSchema.index({ ownerId: 1, name: 1 }, { unique: true }); // Unique collection names per user
collectionSchema.index({ ownerId: 1, isActive: 1 }); // Active collections per user
collectionSchema.index({ shareToken: 1 }); // Share token lookup
collectionSchema.index({ 'invitedEmails': 1 }); // Email-based access
collectionSchema.index({ lastUpdated: -1 }); // Recently updated collections
collectionSchema.index({ lastAccessed: -1 }); // Recently accessed collections
collectionSchema.index({ isPublic: 1, isActive: 1 }); // Public collections
collectionSchema.index({ itemCount: -1 }); // Collections by size

// Text search index
collectionSchema.index({ 
  name: 'text', 
  description: 'text' 
}, {
  weights: {
    name: 10,
    description: 5
  }
});

// Virtual for getting items count
collectionSchema.virtual('itemsCount').get(function() {
  return this.itemIds ? this.itemIds.length : 0;
});

// Virtual for getting share URL
collectionSchema.virtual('shareUrl').get(function() {
  return this.shareToken ? `/stylist/${this.ownerId}?collection=${this._id}&token=${this.shareToken}` : null;
});

// Middleware to update itemCount when itemIds change
collectionSchema.pre('save', function(next) {
  this.itemCount = this.itemIds ? this.itemIds.length : 0;
  this.lastUpdated = new Date();
  next();
});

// Method to add item to collection
collectionSchema.methods.addItem = function(itemId) {
  if (!this.itemIds.includes(itemId)) {
    this.itemIds.push(itemId);
    this.itemCount = this.itemIds.length;
    this.lastUpdated = new Date();
  }
  return this.save();
};

// Method to remove item from collection
collectionSchema.methods.removeItem = function(itemId) {
  this.itemIds = this.itemIds.filter(id => !id.equals(itemId));
  this.itemCount = this.itemIds.length;
  this.lastUpdated = new Date();
  return this.save();
};

// Method to track access
collectionSchema.methods.trackAccess = function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

// Static method to find collections by user with pagination
collectionSchema.statics.findByUser = function(userId, options = {}) {
  const { page = 1, limit = 10, sortBy = 'lastUpdated', sortOrder = -1 } = options;
  const skip = (page - 1) * limit;
  
  return this.find({ ownerId: userId, isActive: true })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean(); // Use lean() for better performance
};

export const Collection = mongoose.model('Collection', collectionSchema);


