import imageCompression from 'browser-image-compression';

// Image optimization configuration
const IMAGE_CONFIG = {
  maxSizeMB: 0.2, // 200KB max file size
  maxWidthOrHeight: 1080, // Max 1080px width or height
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.8,
  alwaysKeepResolution: false
};

// Generate unique filename with hash
export const generateImageFilename = (userId, originalName) => {
  const timestamp = Date.now();
  const randomHash = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${userId}-${timestamp}-${randomHash}.${extension}`;
};

// Compress and resize image
export const optimizeImage = async (file, options = {}) => {
  try {
    const config = { ...IMAGE_CONFIG, ...options };
    
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const compressedFile = await imageCompression(file, config);
    
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image. Please try a different image.');
  }
};

// Validate image file
export const validateImage = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB max before compression
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!file) {
    throw new Error('No file selected');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please select a valid image file (JPEG, PNG, or WebP)');
  }
  
  if (file.size > maxSize) {
    throw new Error('Image file is too large. Please select a smaller image.');
  }
  
  return true;
};

// Create image preview with compression info
export const createImagePreview = (file, onCompress) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const originalSize = file.size;
        const compressedFile = await optimizeImage(file);
        const compressedSize = compressedFile.size;
        
        const preview = {
          url: e.target.result,
          originalSize,
          compressedSize,
          compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(1),
          file: compressedFile
        };
        
        if (onCompress) {
          onCompress(preview);
        }
        
        resolve(preview);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Generate responsive image URLs for Supabase
export const generateResponsiveUrls = (baseUrl, options = {}) => {
  if (!baseUrl || !baseUrl.includes('supabase.co')) {
    return { original: baseUrl };
  }
  
  const { width = 400, height = 400, quality = 80 } = options;
  
  // Supabase image transformation
  const baseUrlWithoutParams = baseUrl.split('?')[0];
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    quality: quality.toString(),
    format: 'webp'
  });
  
  return {
    original: baseUrl,
    thumbnail: `${baseUrlWithoutParams}?${params.toString()}&width=150&height=150&quality=60`,
    small: `${baseUrlWithoutParams}?${params.toString()}&width=300&height=300&quality=70`,
    medium: `${baseUrlWithoutParams}?${params.toString()}&width=600&height=600&quality=80`,
    large: `${baseUrlWithoutParams}?${params.toString()}&width=1080&height=1080&quality=90`
  };
};

// Calculate storage usage
export const calculateStorageUsage = (images) => {
  const totalSize = images.reduce((sum, img) => {
    return sum + (img.compressedSize || img.size || 0);
  }, 0);
  
  const freeTierLimit = 500 * 1024 * 1024; // 500MB
  const usagePercentage = (totalSize / freeTierLimit) * 100;
  
  return {
    totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    freeTierLimit,
    freeTierLimitMB: 500,
    usagePercentage: usagePercentage.toFixed(1),
    remainingMB: ((freeTierLimit - totalSize) / 1024 / 1024).toFixed(2)
  };
};

// Get optimal image URL based on container size
export const getOptimalImageUrl = (baseUrl, containerWidth, containerHeight) => {
  if (!baseUrl || !baseUrl.includes('supabase.co')) {
    return baseUrl;
  }
  
  const maxDimension = Math.max(containerWidth, containerHeight);
  
  if (maxDimension <= 150) {
    return generateResponsiveUrls(baseUrl).thumbnail;
  } else if (maxDimension <= 300) {
    return generateResponsiveUrls(baseUrl).small;
  } else if (maxDimension <= 600) {
    return generateResponsiveUrls(baseUrl).medium;
  } else {
    return generateResponsiveUrls(baseUrl).large;
  }
};

// Generate a lightweight blur placeholder (SVG base64)
export const generateBlurPlaceholder = (w = 200, h = 200, color = '#f3f4f6') => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <defs>
      <filter id='b' color-interpolation-filters='sRGB'>
        <feGaussianBlur stdDeviation='12' />
      </filter>
    </defs>
    <rect width='100%' height='100%' fill='${color}' filter='url(#b)' />
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default {
  generateImageFilename,
  optimizeImage,
  validateImage,
  createImagePreview,
  generateResponsiveUrls,
  calculateStorageUsage,
  getOptimalImageUrl
  , generateBlurPlaceholder
};