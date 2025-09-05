import { Notification } from '../models/Notification.js';
import { Outfit } from '../models/Outfit.js';
import { User } from '../models/User.js';

// Get all notifications for a user
export async function getNotifications(req, res) {
  try {
    const userId = req.user._id;
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await Notification.find({ userId })
      .populate('fromUser', 'name email')
      .populate('relatedId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
}

// Mark notification as read
export async function markAsRead(req, res) {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
}

// Mark all notifications as read
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
}

// Get unread count only
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
}

// Create notification (internal function)
export async function createNotification(notificationData) {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

// Create outfit suggestion notification
export async function notifyOutfitSuggested(outfitId, ownerId, stylistId) {
  try {
    const stylist = await User.findById(stylistId);
    const outfit = await Outfit.findById(outfitId).populate('clothIds', 'name');
    
    if (!stylist || !outfit) return null;

    const message = `${stylist.name} suggested a new outfit: "${outfit.name}"`;
    const link = `/wardrobe/outfits/${outfitId}`;

    return await createNotification({
      userId: ownerId,
      message,
      link,
      type: 'outfit_suggested',
      relatedId: outfitId,
      fromUser: stylistId
    });
  } catch (error) {
    console.error('Notify outfit suggested error:', error);
    return null;
  }
}

// Create outfit response notification
export async function notifyOutfitResponse(outfitId, stylistId, status) {
  try {
    const outfit = await Outfit.findById(outfitId).populate('ownerId', 'name');
    
    if (!outfit) return null;

    const message = `Your outfit suggestion "${outfit.name}" was ${status}`;
    const link = `/wardrobe/outfits/${outfitId}`;

    return await createNotification({
      userId: stylistId,
      message,
      link,
      type: `outfit_${status}`,
      relatedId: outfitId,
      fromUser: outfit.ownerId._id
    });
  } catch (error) {
    console.error('Notify outfit response error:', error);
    return null;
  }
}
