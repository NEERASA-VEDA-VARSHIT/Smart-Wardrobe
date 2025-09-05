import mongoose from 'mongoose';

const wardrobeItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true }, // e.g., pants, shirt, etc.
    color: { type: String, required: true, trim: true },
    lastUsed: { type: Date, default: null },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sharedWith: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      permission: { type: String, enum: ['viewer', 'stylist'], default: 'viewer' },
      invitedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export const WardrobeItem = mongoose.model('WardrobeItem', wardrobeItemSchema);
