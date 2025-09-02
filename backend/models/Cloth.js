import mongoose from 'mongoose';

const clothSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // URL or data URI
    worn: { type: Boolean, default: false },
    lastWorn: { type: Date, default: null },
    washed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Cloth = mongoose.model('Cloth', clothSchema);
