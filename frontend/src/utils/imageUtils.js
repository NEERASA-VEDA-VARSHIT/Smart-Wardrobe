// Utility function to get the correct image URL
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL (Supabase), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a local path, prepend the backend URL
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:8000${imageUrl}`;
  }
  
  // Default fallback
  return imageUrl;
};

// Helper function to check if an image URL is from Supabase
export const isSupabaseUrl = (imageUrl) => {
  return imageUrl && imageUrl.includes('supabase');
};

// Helper function to get image alt text
export const getImageAlt = (item) => {
  if (!item) return 'Clothing item';
  return `${item.name} - ${item.type} in ${item.color}`;
};
