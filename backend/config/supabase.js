import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://nqyoczcowkrvrchqktpx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY is not defined in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to upload image to Supabase Storage
export const uploadImageToSupabase = async (file, bucketName = 'wardrobe-images', pathPrefix = 'clothes') => {
  try {
    // Generate unique filename
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const safePrefix = pathPrefix?.replace(/^\/+|\/+$/g, '') || 'clothes';
    const filePath = `${safePrefix}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL
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
    const { error } = await supabase.storage
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
