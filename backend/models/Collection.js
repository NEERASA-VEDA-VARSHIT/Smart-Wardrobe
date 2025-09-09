import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cloth', required: true }],
    shareToken: { type: String, index: true },
    invitedEmails: [{ type: String, trim: true }],
    permissions: {
      type: String,
      enum: ['viewer', 'stylist'],
      default: 'stylist'
    }
  },
  { timestamps: true }
);

collectionSchema.index({ ownerId: 1, name: 1 }, { unique: false });

export const Collection = mongoose.model('Collection', collectionSchema);


