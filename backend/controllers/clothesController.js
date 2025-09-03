import { Cloth } from '../models/Cloth.js';
import path from 'path';
import fs from 'fs';

export async function listClothes(req, res) {
  try {
    const userId = req.user._id;
    const items = await Cloth.find({ userId }).sort({ lastWorn: -1, createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('List clothes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch clothes',
      error: error.message 
    });
  }
}

export async function createCloth(req, res) {
  try {
    const { name, type, color, worn = false, lastWorn = null, washed = true } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user._id;
    
    if (!name || !type || !color || !imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'name, type, color, and image are required' 
      });
    }
    
    const item = await Cloth.create({ 
      name, 
      type, 
      color, 
      imageUrl, 
      worn, 
      lastWorn, 
      washed, 
      userId 
    });
    
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Create cloth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create cloth item',
      error: error.message 
    });
  }
}

export async function updateCloth(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;
    
    // Handle file upload for image updates
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Only allow updating items that belong to the user
    const item = await Cloth.findOneAndUpdate(
      { _id: id, userId }, 
      updates, 
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cloth item not found or access denied' 
      });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Update cloth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update cloth item',
      error: error.message 
    });
  }
}

export async function deleteCloth(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Only allow deleting items that belong to the user
    const item = await Cloth.findOneAndDelete({ _id: id, userId });
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cloth item not found or access denied' 
      });
    }
    
    // Delete the associated image file
    if (item.imageUrl) {
      const imagePath = path.join(process.cwd(), 'uploads', path.basename(item.imageUrl));
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }
    
    res.json({ success: true, message: 'Cloth item deleted successfully' });
  } catch (error) {
    console.error('Delete cloth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete cloth item',
      error: error.message 
    });
  }
}
