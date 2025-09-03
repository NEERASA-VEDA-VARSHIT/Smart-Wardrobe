import mongoose from 'mongoose';

const clothSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true }, // URL to uploaded image
    worn: { type: Boolean, default: false },
    lastWorn: { type: Date, default: null },
    washed: { type: Boolean, default: true },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }, // Link to user who owns this item
  },
  { timestamps: true }
);

export const Cloth = mongoose.model('Cloth', clothSchema);
