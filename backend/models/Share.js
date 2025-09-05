import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    friendEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked'],
      default: 'pending'
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

export const Share = mongoose.model('Share', shareSchema);


