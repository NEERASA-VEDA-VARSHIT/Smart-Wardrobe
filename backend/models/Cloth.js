import mongoose from 'mongoose';

const clothSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, required: true, trim: true, maxlength: 50 },
    color: { type: String, required: true, trim: true, maxlength: 50 },
    occasion: { type: String, default: 'casual', trim: true, maxlength: 50 },
    // Human-readable description built from confirmed metadata
    description: { type: String, trim: true, maxlength: 400 },
    imageUrl: { type: String, required: true, maxlength: 500 },
    worn: { type: Boolean, default: false },
    lastWorn: { type: Date, default: null },
    needsCleaning: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, maxlength: 30 }], // Flat array for better querying
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    // Flatten sharedWith for better performance
    sharedWith: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
      permission: { type: String, enum: ['viewer', 'stylist'], default: 'viewer' },
      invitedAt: { type: Date, default: Date.now }
    }],
    // Add metadata for optimization
    metadata: {
      fileSize: { type: Number, default: 0 },
      uploadDate: { type: Date, default: Date.now },
      lastAccessed: { type: Date, default: Date.now }
    },
    // Optional lightweight vector embedding for RAG/similarity (stored client-side computed or via service)
    embedding: {
      type: [Number],
      default: undefined,
      select: false // keep payloads small
    }
  },
  { 
    timestamps: true,
    // Optimize for queries
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Strategic indexes for optimal query performance
clothSchema.index({ userId: 1, lastWorn: -1 }); // User's clothes by last worn
clothSchema.index({ userId: 1, type: 1 }); // User's clothes by type
clothSchema.index({ userId: 1, color: 1 }); // User's clothes by color
clothSchema.index({ userId: 1, occasion: 1 }); // User's clothes by occasion
clothSchema.index({ userId: 1, worn: 1 }); // User's clothes by worn status
clothSchema.index({ userId: 1, needsCleaning: 1 }); // User's clothes by cleaning status
clothSchema.index({ userId: 1, tags: 1 }); // User's clothes by tags
clothSchema.index({ 'sharedWith.userId': 1 }); // Shared clothes lookup
clothSchema.index({ createdAt: -1 }); // Recent clothes
clothSchema.index({ 'metadata.lastAccessed': -1 }); // Recently accessed clothes

// Compound indexes for complex queries
clothSchema.index({ userId: 1, type: 1, color: 1 }); // Multi-field filtering
clothSchema.index({ userId: 1, worn: 1, lastWorn: -1 }); // Worn clothes by date
clothSchema.index({ userId: 1, needsCleaning: 1, lastWorn: -1 }); // Cleaning by date

// Text index for search functionality
clothSchema.index({ 
  name: 'text', 
  type: 'text', 
  color: 'text', 
  tags: 'text' 
}, {
  weights: {
    name: 10,
    type: 5,
    color: 3,
    tags: 2
  }
});

export const Cloth = mongoose.model('Cloth', clothSchema);
