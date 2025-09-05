import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      trim: true
    },
    read: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['outfit_suggested', 'outfit_accepted', 'outfit_rejected', 'item_status_change'],
      required: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit'
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
