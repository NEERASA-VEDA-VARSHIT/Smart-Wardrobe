import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not defined in environment variables');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY is not defined in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for maintenance tasks (requires service role key)
export const getAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

// Create signed URL (read-only, time-limited) for stylist/shared links
export const createSignedUrl = async (filePath, expiresInSeconds = 60 * 60, bucketName = 'wardrobe-images') => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to upload image to Supabase Storage
export const uploadImageToSupabase = async (file, bucketName = 'wardrobe-images', pathPrefix = 'clothes', userId = null) => {
  try {
    // Use admin client for uploads (requires service role key)
    const adminClient = getAdminClient();
    if (!adminClient) {
      return {
        success: false,
        error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.'
      };
    }

    // Generate hash-based filename to prevent duplicates
    const fileExt = file.originalname.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const hash = Math.random().toString(36).substring(2, 15);
    const fileName = userId ? `${userId}-${timestamp}-${hash}.${fileExt}` : `${timestamp}-${hash}.${fileExt}`;
    
    const safePrefix = pathPrefix?.replace(/^\/+|\/+$/g, '') || 'clothes';
    const filePath = `${safePrefix}/${fileName}`;

    // Upload file to Supabase Storage using admin client
    const { data, error } = await adminClient.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL using regular client
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to delete image from Supabase Storage
export const deleteImageFromSupabase = async (filePath, bucketName = 'wardrobe-images') => {
  try {
    // Use admin client for deletions
    const adminClient = getAdminClient();
    if (!adminClient) {
      return {
        success: false,
        error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.'
      };
    }

    const { error } = await adminClient.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to check if bucket exists (don't create automatically due to RLS)
export const ensureBucketExists = async (bucketName = 'wardrobe-images') => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error) {
      console.warn(`Bucket '${bucketName}' may not exist or may not be accessible. Please create it manually in Supabase dashboard.`);
      return {
        success: false,
        error: `Bucket '${bucketName}' not accessible. Please create it manually in Supabase dashboard with public access.`
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error checking bucket:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
