import { Cloth } from '../models/Cloth.js';
import { uploadImageToSupabase, deleteImageFromSupabase, ensureBucketExists } from '../config/supabase.js';

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
    const { name, type, color, occasion = 'casual' } = req.body;
    const userId = req.user._id;
    
    if (!name || !type || !color || !req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'name, type, color, and image are required' 
      });
    }

    // Check if Supabase bucket exists (warn if not)
    const bucketCheck = await ensureBucketExists();
    if (!bucketCheck.success) {
      console.warn('Supabase bucket check failed:', bucketCheck.error);
    }

    // Upload image to Supabase (store under clothes/<userId>/)
    const uploadResult = await uploadImageToSupabase(req.file, 'wardrobe-images', `clothes/${userId}`);
    
    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: uploadResult.error
      });
    }
    
    // Initial state: worn = false, needsCleaning = false, lastWorn = null
    const item = await Cloth.create({ 
      name, 
      type, 
      color, 
      occasion,
      imageUrl: uploadResult.url, // Use Supabase URL
      worn: false,
      lastWorn: null,
      needsCleaning: false,
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
    
    console.log('Update request body:', req.body);
    console.log('Update request action:', req.body.action);
    
    // Handle both JSON and FormData
    let updates = {};
    
    if (req.body && typeof req.body === 'object') {
      // Handle state transitions based on action
      if (req.body.action === 'markWorn') {
        // Mark as Worn: lastWorn = today, worn = true, needsCleaning = true
        updates.worn = true;
        updates.lastWorn = new Date();
        updates.needsCleaning = true;
      } else if (req.body.action === 'markUnworn') {
        // Mark as Unworn: worn = false, lastWorn stays as last recorded date
        updates.worn = false;
        // lastWorn remains unchanged
      } else if (req.body.action === 'cleaned') {
        // Cleaned: needsCleaning = false, worn = false, lastWorn unchanged
        updates.needsCleaning = false;
        updates.worn = false;
        // lastWorn remains unchanged
      } else if (req.body.action === 'markClean') {
        // Just mark as clean without changing worn status
        updates.needsCleaning = false;
      } else {
        // Handle direct field updates for backward compatibility
        if (req.body.worn !== undefined) {
          updates.worn = req.body.worn === 'true' || req.body.worn === true;
        }
        if (req.body.lastWorn !== undefined) {
          updates.lastWorn = req.body.lastWorn === 'null' || req.body.lastWorn === null ? null : new Date(req.body.lastWorn);
        }
        if (req.body.needsCleaning !== undefined) {
          updates.needsCleaning = req.body.needsCleaning === 'true' || req.body.needsCleaning === true;
        }
        if (req.body.name !== undefined) {
          updates.name = req.body.name;
        }
        if (req.body.type !== undefined) {
          updates.type = req.body.type;
        }
        if (req.body.color !== undefined) {
          updates.color = req.body.color;
        }
        if (req.body.occasion !== undefined) {
          updates.occasion = req.body.occasion;
        }
      }
    }
    
    
    // Handle file upload for image updates
    if (req.file) {
      // Check if Supabase bucket exists (warn if not)
      const bucketCheck = await ensureBucketExists();
      if (!bucketCheck.success) {
        console.warn('Supabase bucket check failed:', bucketCheck.error);
      }

      // Upload new image to Supabase (store under clothes/<userId>/)
      const uploadResult = await uploadImageToSupabase(req.file, 'wardrobe-images', `clothes/${userId}`);
      
      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new image',
          error: uploadResult.error
        });
      }

      // Get the current item to delete old image
      const currentItem = await Cloth.findById(id);
      if (currentItem && currentItem.imageUrl) {
        // Extract path from Supabase URL for deletion
        const urlParts = currentItem.imageUrl.split('/');
        const oldPath = urlParts.slice(-2).join('/'); // Get 'clothes/filename'
        
        // Delete old image from Supabase
        await deleteImageFromSupabase(oldPath);
      }

      updates.imageUrl = uploadResult.url;
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
    
    // Delete the associated image from Supabase
    if (item.imageUrl && item.imageUrl.includes('supabase')) {
      try {
        // Extract path from Supabase URL
        const urlParts = item.imageUrl.split('/');
        const imagePath = urlParts.slice(-2).join('/'); // Get 'clothes/filename'
        
        const deleteResult = await deleteImageFromSupabase(imagePath);
        if (!deleteResult.success) {
          console.warn('Failed to delete image from Supabase:', deleteResult.error);
        }
      } catch (fileError) {
        console.warn('Failed to delete image from Supabase:', fileError.message);
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
