import mongoose from 'mongoose';
import { Cloth } from '../models/Cloth.js';
import { WardrobeItem } from '../models/WardrobeItem.js';
import { User } from '../models/User.js';

// Share wardrobe with a friend
export async function shareWardrobe(req, res) {
  try {
    const { friendEmail, permission = 'viewer' } = req.body;
    const ownerId = req.user._id;

    if (!friendEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Friend email is required' 
      });
    }

    // Find the friend by email
    const friend = await User.findOne({ email: friendEmail.toLowerCase() });
    if (!friend) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      });
    }

    if (friend._id.toString() === ownerId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot share wardrobe with yourself' 
      });
    }

    // Update all clothes to include this friend
    const clothUpdateResult = await Cloth.updateMany(
      { userId: ownerId },
      { 
        $addToSet: { 
          sharedWith: { 
            user: friend._id, 
            permission, 
            invitedAt: new Date() 
          } 
        } 
      }
    );

    // Update all wardrobe items to include this friend
    const itemUpdateResult = await WardrobeItem.updateMany(
      { userId: ownerId },
      { 
        $addToSet: { 
          sharedWith: { 
            user: friend._id, 
            permission, 
            invitedAt: new Date() 
          } 
        } 
      }
    );

    res.json({ 
      success: true, 
      message: `Wardrobe shared with ${friend.name || friendEmail}`,
      data: {
        friend: {
          id: friend._id,
          name: friend.name,
          email: friend.email
        },
        permission,
        clothesUpdated: clothUpdateResult.modifiedCount,
        itemsUpdated: itemUpdateResult.modifiedCount
      }
    });
  } catch (error) {
    console.error('Share wardrobe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to share wardrobe',
      error: error.message 
    });
  }
}

// Get shared wardrobes (wardrobes shared with current user)
export async function getSharedWardrobes(req, res) {
  try {
    const userId = req.user._id;

    // Find all clothes shared with this user
    const sharedClothes = await Cloth.find({
      'sharedWith.user': userId
    }).populate('userId', 'name email');

    // Find all wardrobe items shared with this user
    const sharedItems = await WardrobeItem.find({
      'sharedWith.user': userId
    }).populate('userId', 'name email');

    // Group by owner
    const wardrobesByOwner = {};

    [...sharedClothes, ...sharedItems].forEach(item => {
      const ownerId = item.userId._id.toString();
      if (!wardrobesByOwner[ownerId]) {
        wardrobesByOwner[ownerId] = {
          owner: item.userId,
          clothes: [],
          items: [],
          permission: 'viewer'
        };
      }

      // Get permission level for this user
      const shareInfo = item.sharedWith.find(s => s.user.toString() === userId.toString());
      if (shareInfo && shareInfo.permission === 'stylist') {
        wardrobesByOwner[ownerId].permission = 'stylist';
      }

      if (item.imageUrl) {
        wardrobesByOwner[ownerId].clothes.push(item);
      } else {
        wardrobesByOwner[ownerId].items.push(item);
      }
    });

    const sharedWardrobes = Object.values(wardrobesByOwner);

    res.json({ 
      success: true, 
      data: sharedWardrobes 
    });
  } catch (error) {
    console.error('Get shared wardrobes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get shared wardrobes',
      error: error.message 
    });
  }
}

// Get specific shared wardrobe by owner ID
export async function getSharedWardrobe(req, res) {
  try {
    const { ownerId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid owner ID' 
      });
    }

    // Find clothes shared with this user by this owner
    const sharedClothes = await Cloth.find({
      userId: ownerId,
      'sharedWith.user': userId
    }).populate('userId', 'name email');

    // Find wardrobe items shared with this user by this owner
    const sharedItems = await WardrobeItem.find({
      userId: ownerId,
      'sharedWith.user': userId
    }).populate('userId', 'name email');

    // Get permission level
    let permission = 'viewer';
    if (sharedClothes.length > 0) {
      const shareInfo = sharedClothes[0].sharedWith.find(s => s.user.toString() === userId.toString());
      if (shareInfo && shareInfo.permission === 'stylist') {
        permission = 'stylist';
      }
    }

    res.json({ 
      success: true, 
      data: {
        clothes: sharedClothes,
        items: sharedItems,
        permission
      }
    });
  } catch (error) {
    console.error('Get shared wardrobe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get shared wardrobe',
      error: error.message 
    });
  }
}

// Remove sharing with a friend
export async function unshareWardrobe(req, res) {
  try {
    const { friendId } = req.params;
    const ownerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid friend ID' 
      });
    }

    // Remove friend from all clothes
    const clothUpdateResult = await Cloth.updateMany(
      { userId: ownerId },
      { $pull: { sharedWith: { user: friendId } } }
    );

    // Remove friend from all wardrobe items
    const itemUpdateResult = await WardrobeItem.updateMany(
      { userId: ownerId },
      { $pull: { sharedWith: { user: friendId } } }
    );

    res.json({ 
      success: true, 
      message: 'Wardrobe access removed',
      data: {
        clothesUpdated: clothUpdateResult.modifiedCount,
        itemsUpdated: itemUpdateResult.modifiedCount
      }
    });
  } catch (error) {
    console.error('Unshare wardrobe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove wardrobe access',
      error: error.message 
    });
  }
}
