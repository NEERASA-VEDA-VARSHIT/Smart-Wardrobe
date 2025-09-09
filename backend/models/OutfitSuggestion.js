import mongoose from 'mongoose';

const outfitSuggestionSchema = new mongoose.Schema(
  {
    // The user who owns the wardrobe
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // The stylist who created the suggestion
    stylist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // The outfit items
    items: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cloth',
      required: true
    }],
    
    // Suggestion details
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Outfit Suggestion'
    },
    
    description: {
      type: String,
      trim: true,
      default: ''
    },
    
    occasion: {
      type: String,
      enum: ['casual', 'work', 'party', 'formal', 'sport', 'date', 'travel', 'any'],
      default: 'casual'
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'modified'],
      default: 'pending'
    },
    
    // Feedback from owner
    feedback: {
      type: String,
      trim: true
    },
    
    // When the suggestion was created
    suggestedAt: {
      type: Date,
      default: Date.now
    },
    
    // When the owner responded
    respondedAt: {
      type: Date
    },
    
    // If the outfit was modified by the owner
    modifications: [{
      action: {
        type: String,
        enum: ['added', 'removed', 'replaced']
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cloth'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Tags for organization
    tags: [{
      type: String,
      trim: true
    }],
    
    // Confidence score (for future ML integration)
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    // Comments thread between owner and stylist
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['owner', 'stylist'], required: true },
        message: { type: String, trim: true, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    // Planner support
    plannedAt: { type: Date },
    source: { type: String, enum: ['self', 'friend', 'system'], default: 'friend' }
  },
  { 
    timestamps: true,
    // Indexes for better performance
    indexes: [
      { owner: 1, status: 1 },
      { stylist: 1, suggestedAt: -1 },
      { owner: 1, suggestedAt: -1 }
    ]
  }
);

// Virtual for getting the stylist's name
outfitSuggestionSchema.virtual('stylistName').get(function() {
  return this.stylist?.name || 'Unknown Stylist';
});

// Virtual for getting the number of items
outfitSuggestionSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Method to mark as accepted
outfitSuggestionSchema.methods.accept = function(feedback) {
  this.status = 'accepted';
  this.respondedAt = new Date();
  if (feedback) this.feedback = feedback;
  return this.save();
};

// Method to mark as rejected
outfitSuggestionSchema.methods.reject = function(feedback) {
  this.status = 'rejected';
  this.respondedAt = new Date();
  if (feedback) this.feedback = feedback;
  return this.save();
};

// Method to mark as modified
outfitSuggestionSchema.methods.markAsModified = function(modifications) {
  this.status = 'modified';
  this.respondedAt = new Date();
  if (modifications) this.modifications.push(...modifications);
  return this.save();
};

export const OutfitSuggestion = mongoose.model('OutfitSuggestion', outfitSuggestionSchema);
