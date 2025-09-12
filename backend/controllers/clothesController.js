import { Cloth } from '../models/Cloth.js';
import { uploadImageToSupabase, deleteImageFromSupabase, ensureBucketExists } from '../config/supabase.js';
import { buildDescriptionFromMetadata, generateEmbeddingFromText } from '../utils/embeddings.js';
import { generateClothingMetadataFromImage } from '../utils/metadata.js';

export async function listClothes(req, res) {
  try {
    const userId = req.user._id;
    const { 
      type, 
      color, 
      occasion, 
      worn, 
      needsCleaning, 
      search,
      sortBy = 'lastWorn',
      sortOrder = 'desc',
      limit,
      page = 1
    } = req.query;

    // Build filter object
    const filter = { userId };
    
    if (type) filter.type = { $regex: type, $options: 'i' };
    if (color) filter.color = { $regex: color, $options: 'i' };
    if (occasion) filter.occasion = { $regex: occasion, $options: 'i' };
    if (worn !== undefined) filter.worn = worn === 'true';
    if (needsCleaning !== undefined) filter.needsCleaning = needsCleaning === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'lastWorn') {
      sort.lastWorn = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'createdAt') {
      sort.createdAt = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'desc' ? -1 : 1;
    }

    // Add secondary sort
    if (sortBy !== 'lastWorn') {
      sort.lastWorn = -1;
    }
    if (sortBy !== 'createdAt') {
      sort.createdAt = -1;
    }

    // Execute query
    let query = Cloth.find(filter).sort(sort);
    
    if (limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      query = query.skip(skip).limit(parseInt(limit));
    }

    const items = await query;
    const total = await Cloth.countDocuments(filter);

    res.json({ 
      success: true, 
      data: items,
      pagination: limit ? {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      } : null
    });
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
    const uploadResult = await uploadImageToSupabase(req.file, 'wardrobe-images', `clothes/${userId}`, userId);
    
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

// Generate metadata draft from minimal inputs (image + sparse fields)
export async function generateMetadataDraft(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'image is required' });
    }
    const { mimetype, buffer } = req.file;
    let draft;
    if (req.body?.manualFirst === 'true') {
      // Return empty draft so UI shows manual edit immediately
      draft = { name: '', type: '', color: '', pattern: '', material: '', occasion: '', season: '', formality: '', weather: '' };
    } else {
      const hints = {
        type: req.body?.type || '',
        color: req.body?.color || '',
        occasion: req.body?.occasion || ''
      };
      draft = await generateClothingMetadataFromImage(buffer, mimetype, hints);
    }
    // If user provided a name, prefer it; else try filename basename; else model
    const providedName = req.body?.name?.trim();
    if (!draft.name) {
      const fileName = req.file?.originalname || '';
      const baseName = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      draft.name = providedName || baseName || 'Clothing Item';
    } else if (providedName) {
      draft.name = providedName;
    }
    return res.json({ success: true, data: draft });
  } catch (error) {
    console.error('Metadata draft error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate metadata draft' });
  }
}

// Confirm metadata: build description, embed, persist as new cloth
export async function confirmMetadata(req, res) {
  try {
    const userId = req.user._id;
    const { name, type, color, occasion = 'casual', pattern, material, season, formality } = req.body;

    if (!name || !type || !color || !req.file) {
      return res.status(400).json({ success: false, message: 'name, type, color and image are required' });
    }

    // Upload image first
    const uploadResult = await uploadImageToSupabase(req.file, 'wardrobe-images', `clothes/${userId}`, userId);
    if (!uploadResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to upload image', 
        error: uploadResult.error,
        details: 'Please ensure the Supabase bucket "wardrobe-images" exists and is accessible. Check your Supabase dashboard.'
      });
    }

    const metadata = { name, type, color, occasion, pattern, material, season, formality };
    const description = buildDescriptionFromMetadata(metadata);

    // Optional embedding (best-effort)
    let embedding;
    const shouldEmbed = (req.query.embed === 'true') || (req.body.embed === 'true');
    if (shouldEmbed) {
      try {
        embedding = await generateEmbeddingFromText(description);
      } catch (e) {
        console.warn('Embedding generation failed (continuing without vector):', e.message);
      }
    }

    const item = await Cloth.create({
      name,
      type,
      color,
      occasion,
      description,
      imageUrl: uploadResult.url,
      worn: false,
      lastWorn: null,
      needsCleaning: false,
      embedding,
      userId,
      metadata: {
        ...(metadata || {}),
        uploadDate: new Date()
      }
    });

    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Confirm metadata error:', error);
    return res.status(500).json({ success: false, message: 'Failed to confirm metadata', error: error.message });
  }
}

// Generate or regenerate embedding for an item
export async function generateEmbeddingForCloth(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const cloth = await Cloth.findOne({ _id: id, userId });
    if (!cloth) return res.status(404).json({ success: false, message: 'Item not found' });

    const description = cloth.description || buildDescriptionFromMetadata(cloth.metadata || {});
    const embedding = await generateEmbeddingFromText(description);
    cloth.embedding = embedding;
    await cloth.save();
    return res.json({ success: true, data: { id: cloth._id, embeddingLength: embedding.length } });
  } catch (error) {
    console.error('Generate embedding error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate embedding' });
  }
}

// Vector search endpoint using MongoDB Atlas Vector Search
export async function searchClothesByVector(req, res) {
  try {
    const userId = req.user._id;
    const { queryText, limit = 10, filter = {} } = req.body || {};
    if (!queryText) return res.status(400).json({ success: false, message: 'queryText is required' });

    const embedding = await generateEmbeddingFromText(queryText);
    const k = Math.max(1, Math.min(100, Number(limit)));

    // Optional metadata filters applied in the pipeline
    const metadataFilter = { userId };
    if (filter.season) metadataFilter['metadata.season'] = new RegExp(filter.season, 'i');
    if (filter.formality) metadataFilter['metadata.formality'] = new RegExp(filter.formality, 'i');
    if (filter.weather) metadataFilter['metadata.weather'] = new RegExp(filter.weather, 'i');

    const pipeline = [
      {
        $vectorSearch: {
          index: 'cloth_embedding_index',
          path: 'embedding',
          queryVector: embedding,
          numCandidates: Math.max(k * 5, 100),
          limit: k,
          filter: metadataFilter
        }
      },
      {
        $project: {
          name: 1,
          type: 1,
          color: 1,
          occasion: 1,
          imageUrl: 1,
          description: 1,
          metadata: 1,
          _id: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    const results = await Cloth.aggregate(pipeline).exec();
    return res.json({ success: true, data: results });
  } catch (error) {
    console.error('Vector search error:', error);
    return res.status(500).json({ success: false, message: 'Failed to perform vector search' });
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
      const uploadResult = await uploadImageToSupabase(req.file, 'wardrobe-images', `clothes/${userId}`, userId);
      
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

// Bulk update endpoints
export async function bulkUpdateClothes(req, res) {
  try {
    const { updates } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required and must not be empty'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, ...updateData } = update;
        
        // Validate that the item belongs to the user
        const item = await Cloth.findOne({ _id: id, userId });
        if (!item) {
          errors.push({ id, error: 'Item not found or access denied' });
          continue;
        }

        const updatedItem = await Cloth.findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        results.push(updatedItem);
      } catch (error) {
        errors.push({ id: update.id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Updated ${results.length} items successfully`,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk update clothes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update clothes',
      error: error.message
    });
  }
}

// PATCH endpoint for minimal updates
export async function patchCloth(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.imageUrl; // Use separate endpoint for image updates

    const item = await Cloth.findOneAndUpdate(
      { _id: id, userId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cloth item not found'
      });
    }

    res.json({
      success: true,
      message: 'Cloth item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Patch cloth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cloth item',
      error: error.message
    });
  }
}
