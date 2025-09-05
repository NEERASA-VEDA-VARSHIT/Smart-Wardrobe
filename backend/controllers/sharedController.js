import { Share } from '../models/Share.js';
import { Cloth } from '../models/Cloth.js';
import { Outfit } from '../models/Outfit.js';
import { notifyOutfitSuggested, notifyOutfitResponse } from './notificationController.js';
import mongoose from 'mongoose';

async function ensureAccess(userId, ownerId) {
  try {
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return false;
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }
    
    const share = await Share.findOne({ ownerId, friendId: userId, status: 'accepted' });
    return Boolean(share) || String(userId) === String(ownerId);
  } catch (error) {
    console.error('Error in ensureAccess:', error);
    return false;
  }
}

export async function listSharedClothes(req, res) {
  try {
    const userId = req.user._id;
    const { ownerId } = req.params;
    
    
    // Validate ownerId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: 'Invalid owner ID format' });
    }
    
    const allowed = await ensureAccess(userId, ownerId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const items = await Cloth.find({ userId: ownerId }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('listSharedClothes error:', error);
    res.status(500).json({ success: false, message: 'Failed to load shared clothes', error: error.message });
  }
}

export async function listOutfits(req, res) {
  try {
    const userId = req.user._id;
    const { ownerId } = req.params;
    
    
    // Validate ownerId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: 'Invalid owner ID format' });
    }
    
    const allowed = await ensureAccess(userId, ownerId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const outfits = await Outfit.find({ ownerId }).populate('clothIds').sort({ createdAt: -1 });
    res.json({ success: true, data: outfits });
  } catch (error) {
    console.error('listOutfits error:', error);
    res.status(500).json({ success: false, message: 'Failed to load shared outfits', error: error.message });
  }
}

export async function createOutfit(req, res) {
  try {
    const userId = req.user._id;
    const { ownerId } = req.params;
    const { name, description, clothIds, notes, suggestedFor } = req.body;
    
    
    // Validate ownerId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: 'Invalid owner ID format' });
    }
    
    if (!name || !Array.isArray(clothIds) || clothIds.length === 0) {
      return res.status(400).json({ success: false, message: 'name and clothIds required' });
    }
    
    const allowed = await ensureAccess(userId, ownerId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Validate that all cloth items belong to the owner
    const validCloths = await Cloth.find({
      _id: { $in: clothIds },
      userId: ownerId
    });

    if (validCloths.length !== clothIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some cloth items do not belong to this wardrobe' 
      });
    }

    // Check for items that need cleaning or are already worn
    const warnings = [];
    const blockedItems = [];

    for (const cloth of validCloths) {
      if (cloth.needsCleaning) {
        warnings.push(`${cloth.name} needs cleaning before use`);
      }
      if (cloth.worn) {
        blockedItems.push(cloth.name);
      }
    }

    if (blockedItems.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot create outfit with items that are currently worn: ${blockedItems.join(', ')}` 
      });
    }
    
    const outfit = await Outfit.create({ 
      ownerId, 
      createdBy: userId, 
      name, 
      description,
      clothIds,
      status: 'suggested',
      notes: notes || (warnings.length > 0 ? warnings.join('; ') : undefined),
      suggestedFor: suggestedFor ? new Date(suggestedFor) : undefined
    });

    const populatedOutfit = await Outfit.findById(outfit._id)
      .populate('clothIds', 'name type color imageUrl worn washed lastWorn occasion')
      .populate('createdBy', 'name email')
      .populate('ownerId', 'name email');

    // Send notification to owner about new outfit suggestion
    await notifyOutfitSuggested(outfit._id, ownerId, userId);

    res.status(201).json({ 
      success: true, 
      data: populatedOutfit,
      warnings: warnings.length > 0 ? warnings : undefined
    });
  } catch (error) {
    console.error('createOutfit error:', error);
    res.status(500).json({ success: false, message: 'Failed to create outfit', error: error.message });
  }
}

// Get outfits for owner (suggested, accepted, rejected)
export async function getMyOutfits(req, res) {
  try {
    const userId = req.user._id;
    
    const outfits = await Outfit.find({ ownerId: userId })
      .populate('clothIds', 'name type color imageUrl worn washed lastWorn occasion')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: outfits });
  } catch (error) {
    console.error('getMyOutfits error:', error);
    res.status(500).json({ success: false, message: 'Failed to load outfits', error: error.message });
  }
}

// Accept or reject an outfit
export async function updateOutfitStatus(req, res) {
  try {
    const { outfitId } = req.params;
    const { status, ownerNotes } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(outfitId)) {
      return res.status(400).json({ success: false, message: 'Invalid outfit ID format' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
    }

    const outfit = await Outfit.findOne({ _id: outfitId, ownerId: userId });
    if (!outfit) {
      return res.status(404).json({ success: false, message: 'Outfit not found' });
    }

    const updateData = { 
      status,
      ownerNotes 
    };

    if (status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    const updatedOutfit = await Outfit.findByIdAndUpdate(
      outfitId, 
      updateData, 
      { new: true }
    )
    .populate('clothIds', 'name type color imageUrl worn washed lastWorn occasion')
    .populate('createdBy', 'name email');

    // Send notification to stylist about outfit response
    await notifyOutfitResponse(outfitId, outfit.createdBy, status);

    res.json({ success: true, data: updatedOutfit });
  } catch (error) {
    console.error('updateOutfitStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update outfit status', error: error.message });
  }
}


