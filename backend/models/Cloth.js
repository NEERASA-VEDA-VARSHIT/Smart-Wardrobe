import mongoose from 'mongoose';

const clothSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    occasion: { type: String, default: 'casual', trim: true }, // casual, formal, party, workout, etc.
    imageUrl: { type: String, required: true }, // URL to uploaded image
    worn: { type: Boolean, default: false },
    lastWorn: { type: Date, default: null },
    needsCleaning: { type: Boolean, default: false },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }, // Link to user who owns this item
    sharedWith: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      permission: { type: String, enum: ['viewer', 'stylist'], default: 'viewer' },
      invitedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export const Cloth = mongoose.model('Cloth', clothSchema);
