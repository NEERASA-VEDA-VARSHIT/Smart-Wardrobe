import { OutfitSuggestion } from '../models/OutfitSuggestion.js';
import { Cloth } from '../models/Cloth.js';
import { User } from '../models/User.js';
import { Collection } from '../models/Collection.js';

// Get all suggestions for a wardrobe owner
export const getMySuggestions = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const suggestions = await OutfitSuggestion.find({ owner: ownerId })
      .populate('stylist', 'name email')
      .populate('items', 'name type color occasion imageUrl worn needsCleaning')
      .sort({ suggestedAt: -1 });

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get outfit suggestions'
    });
  }
};

// Get suggestions I created as a stylist
export const getMyCreatedSuggestions = async (req, res) => {
  try {
    const stylistId = req.user.id;
    
    const suggestions = await OutfitSuggestion.find({ stylist: stylistId })
      .populate('owner', 'name email')
      .populate('items', 'name type color occasion imageUrl worn needsCleaning')
      .sort({ suggestedAt: -1 });

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get created suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get created suggestions'
    });
  }
};

// Create a new outfit suggestion
export const createSuggestion = async (req, res) => {
  try {
    const { ownerId, items, title, description, occasion, tags, collectionId } = req.body;
    const stylistId = req.user.id;

    // Validate access: allow if stylist has legacy access OR the request is scoped to a collection
    let allowed = false;
    if (collectionId) {
      const col = await Collection.findOne({ _id: collectionId, ownerId });
      if (!col) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      // Allow creation when using a collection (link/invite based)
      allowed = true;
    }
    if (!allowed) {
      const hasAccess = await checkStylistAccess(stylistId, ownerId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to suggest outfits for this wardrobe'
        });
      }
    }

    // Validate items exist and belong to the owner
    const validItems = await Cloth.find({
      _id: { $in: items },
      userId: ownerId
    });

    if (validItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'Some items do not exist or do not belong to this wardrobe'
      });
    }

    // Create the suggestion
    const suggestion = new OutfitSuggestion({
      owner: ownerId,
      stylist: stylistId,
      items: items,
      title: title || 'Outfit Suggestion',
      description: description || '',
      occasion: occasion || 'casual',
      tags: tags || []
    });

    await suggestion.save();

    // Populate the suggestion with full data
    await suggestion.populate([
      { path: 'stylist', select: 'name email' },
      { path: 'items', select: 'name type color occasion imageUrl worn needsCleaning' }
    ]);

    res.status(201).json({
      success: true,
      data: suggestion,
      message: 'Outfit suggestion created successfully'
    });
  } catch (error) {
    console.error('Create suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create outfit suggestion'
    });
  }
};

// Accept a suggestion
export const acceptSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const ownerId = req.user.id;

    const suggestion = await OutfitSuggestion.findOne({
      _id: id,
      owner: ownerId,
      status: 'pending'
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found or already processed'
      });
    }

    await suggestion.accept(feedback);

    // Populate the updated suggestion
    await suggestion.populate([
      { path: 'stylist', select: 'name email' },
      { path: 'items', select: 'name type color occasion imageUrl worn needsCleaning' }
    ]);

    res.json({
      success: true,
      data: suggestion,
      message: 'Suggestion accepted successfully'
    });
  } catch (error) {
    console.error('Accept suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept suggestion'
    });
  }
};

// Reject a suggestion
export const rejectSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const ownerId = req.user.id;

    const suggestion = await OutfitSuggestion.findOne({
      _id: id,
      owner: ownerId,
      status: 'pending'
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found or already processed'
      });
    }

    await suggestion.reject(feedback);

    // Populate the updated suggestion
    await suggestion.populate([
      { path: 'stylist', select: 'name email' },
      { path: 'items', select: 'name type color occasion imageUrl worn needsCleaning' }
    ]);

    res.json({
      success: true,
      data: suggestion,
      message: 'Suggestion rejected'
    });
  } catch (error) {
    console.error('Reject suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject suggestion'
    });
  }
};

export const deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const doc = await OutfitSuggestion.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Suggestion not found' });
    const canDelete = String(doc.owner) === String(userId) || String(doc.stylist) === String(userId);
    if (!canDelete) return res.status(403).json({ success: false, message: 'Not allowed' });
    await OutfitSuggestion.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete suggestion' });
  }
};

// Get wardrobe items for styling (available to stylists)
export const getWardrobeForStyling = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const stylistId = req.user.id;
    const { collectionId } = req.query || {};

    let allowed = false;
    let collectionDoc = null;
    if (collectionId) {
      collectionDoc = await Collection.findOne({ _id: collectionId, ownerId });
      if (!collectionDoc) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      // For now, any authenticated user with the link can view the collection items
      // (optional: tighten with email match if req.user.email is present and stored)
      allowed = true;
    }

    if (!allowed) {
      // Fallback to legacy share permission check
      const hasAccess = await checkStylistAccess(stylistId, ownerId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this wardrobe'
        });
      }
    }

    // If a collectionId is provided, restrict to its items
    let filter = { userId: ownerId };
    if (collectionDoc) {
      filter._id = { $in: collectionDoc.itemIds };
    }

    const clothes = await Cloth.find(filter).sort({ type: 1, color: 1 });

    res.json({
      success: true,
      data: clothes
    });
  } catch (error) {
    console.error('Get wardrobe for styling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wardrobe for styling'
    });
  }
};

// Get suggestion statistics
export const getSuggestionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await OutfitSuggestion.aggregate([
      {
        $match: {
          $or: [
            { owner: userId },
            { stylist: userId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalReceived: {
            $sum: {
              $cond: [{ $eq: ['$owner', userId] }, 1, 0]
            }
          },
          totalCreated: {
            $sum: {
              $cond: [{ $eq: ['$stylist', userId] }, 1, 0]
            }
          },
          acceptedReceived: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$owner', userId] }, { $eq: ['$status', 'accepted'] }] },
                1,
                0
              ]
            }
          },
          acceptedCreated: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$stylist', userId] }, { $eq: ['$status', 'accepted'] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalReceived: 0,
      totalCreated: 0,
      acceptedReceived: 0,
      acceptedCreated: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get suggestion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestion statistics'
    });
  }
};

// Helper function to check if stylist has access to wardrobe
async function checkStylistAccess(stylistId, ownerId) {
  try {
    // Check if the stylist is in the sharedWith array of any clothes
    const hasAccess = await Cloth.findOne({
      userId: ownerId,
      'sharedWith.user': stylistId,
      'sharedWith.permission': { $in: ['viewer', 'stylist'] }
    });

    return !!hasAccess;
  } catch (error) {
    console.error('Check stylist access error:', error);
    return false;
  }
}

// Planner endpoints
export async function createPlannedOutfit(req, res) {
  try {
    const owner = req.user.id;
    const { items, title = 'Planned Outfit', description = '', occasion = 'casual', plannedAt } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array required' });
    }
    const doc = await OutfitSuggestion.create({
      owner,
      stylist: owner,
      items,
      title,
      description,
      occasion,
      status: 'accepted',
      plannedAt: plannedAt ? new Date(plannedAt) : new Date(),
      source: 'self'
    });
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    console.error('Create planned outfit error:', e);
    res.status(500).json({ success: false, message: 'Failed to save planned outfit' });
  }
}

// Comments
export async function addSuggestionComment(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params; // suggestion id
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }
    const suggestion = await OutfitSuggestion.findById(id);
    if (!suggestion) return res.status(404).json({ success: false, message: 'Suggestion not found' });
    const role = String(suggestion.owner) === String(userId) ? 'owner' : (String(suggestion.stylist) === String(userId) ? 'stylist' : null);
    if (!role) return res.status(403).json({ success: false, message: 'No access to this suggestion' });
    suggestion.comments.push({ author: userId, role, message: message.trim() });
    await suggestion.save();
    await suggestion.populate([
      { path: 'comments.author', select: 'name email' }
    ]);
    res.status(201).json({ success: true, data: suggestion.comments[suggestion.comments.length - 1] });
  } catch (e) {
    console.error('Add suggestion comment error:', e);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
}

export async function listSuggestionComments(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params; // suggestion id
    const suggestion = await OutfitSuggestion.findById(id).populate('comments.author', 'name email');
    if (!suggestion) return res.status(404).json({ success: false, message: 'Suggestion not found' });
    const role = String(suggestion.owner) === String(userId) || String(suggestion.stylist) === String(userId);
    if (!role) return res.status(403).json({ success: false, message: 'No access to this suggestion' });
    res.json({ success: true, data: suggestion.comments.sort((a,b) => a.createdAt - b.createdAt) });
  } catch (e) {
    console.error('List suggestion comments error:', e);
    res.status(500).json({ success: false, message: 'Failed to get comments' });
  }
}

export async function listPlannedOutfits(req, res) {
  try {
    const owner = req.user.id;
    const { from, to } = req.query;
    const query = { owner, plannedAt: { $exists: true } };
    if (from || to) {
      query.plannedAt = {};
      if (from) query.plannedAt.$gte = new Date(from);
      if (to) query.plannedAt.$lte = new Date(to);
    }
    const docs = await OutfitSuggestion.find(query).sort({ plannedAt: 1 }).populate('items');
    res.json({ success: true, data: docs });
  } catch (e) {
    console.error('List planned outfits error:', e);
    res.status(500).json({ success: false, message: 'Failed to load planned outfits' });
  }
}
