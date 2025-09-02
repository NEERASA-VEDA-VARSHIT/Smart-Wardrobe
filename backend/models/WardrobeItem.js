import mongoose from 'mongoose';

const wardrobeItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true }, // e.g., pants, shirt, etc.
    color: { type: String, required: true, trim: true },
    lastUsed: { type: Date, default: null },
  },
  { timestamps: true }
);

export const WardrobeItem = mongoose.model('WardrobeItem', wardrobeItemSchema);
