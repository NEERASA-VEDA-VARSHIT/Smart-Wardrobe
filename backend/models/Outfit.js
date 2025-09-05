import mongoose from 'mongoose';

const outfitSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    clothIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cloth', required: true }],
    status: { 
      type: String, 
      enum: ['suggested', 'accepted', 'rejected'], 
      default: 'suggested' 
    },
    notes: { type: String, trim: true }, // Notes from the stylist
    ownerNotes: { type: String, trim: true }, // Notes from the owner
    suggestedFor: { type: Date }, // When the outfit is suggested for
    acceptedAt: { type: Date },
    rejectedAt: { type: Date }
  },
  { timestamps: true }
);

export const Outfit = mongoose.model('Outfit', outfitSchema);


