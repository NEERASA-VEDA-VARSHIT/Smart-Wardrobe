import { useState, useRef } from 'react';
import { 
  validateImage, 
  createImagePreview, 
  generateImageFilename,
  calculateStorageUsage 
} from '../utils/imageOptimization';

const OptimizedImageUpload = ({ 
  onImageSelect, 
  onImageOptimized, 
  userId, 
  existingImages = [],
  maxImages = 1,
  className = '' 
}) => {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    setError(null);
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      
      // Validate files
      fileArray.forEach(file => validateImage(file));

      // Check if adding these files would exceed max
      if (existingImages.length + fileArray.length > maxImages) {
        throw new Error(`Maximum ${maxImages} images allowed`);
      }

      const newPreviews = [];

      for (const file of fileArray) {
        try {
          const preview = await createImagePreview(file, (previewData) => {
            // Real-time compression feedback
            console.log(`Compressing ${file.name}:`, {
              original: (previewData.originalSize / 1024 / 1024).toFixed(2) + 'MB',
              compressed: (previewData.compressedSize / 1024 / 1024).toFixed(2) + 'MB',
              ratio: previewData.compressionRatio + '%'
            });
          });

          const optimizedFile = {
            ...preview.file,
            name: generateImageFilename(userId, file.name),
            originalName: file.name
          };

          newPreviews.push({
            ...preview,
            file: optimizedFile,
            id: Date.now() + Math.random()
          });
        } catch (fileError) {
          console.error(`Failed to process ${file.name}:`, fileError);
          setError(`Failed to process ${file.name}: ${fileError.message}`);
        }
      }

      setPreviews(prev => [...prev, ...newPreviews]);
      
      // Calculate storage usage
      const allImages = [...existingImages, ...newPreviews];
      const storageInfo = calculateStorageUsage(allImages);
      
      if (onImageOptimized) {
        onImageOptimized(newPreviews, storageInfo);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removePreview = (id) => {
    setPreviews(prev => prev.filter(preview => preview.id !== id));
  };

  const clearAll = () => {
    setPreviews([]);
    setError(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple={maxImages > 1}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        type="button"
        onClick={openFileDialog}
        disabled={uploading || existingImages.length >= maxImages}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm text-gray-600">
            {uploading ? 'Processing...' : 'Click to upload images'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max {maxImages} image{maxImages > 1 ? 's' : ''} • JPEG, PNG, WebP
          </p>
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              Optimized Images ({previews.length})
            </h3>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {previews.map((preview) => (
              <div key={preview.id} className="relative group">
                <img
                  src={preview.url}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-lg"
                />
                
                {/* Compression Info */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 text-white text-xs">
                    <div>Original: {(preview.originalSize / 1024 / 1024).toFixed(2)}MB</div>
                    <div>Compressed: {(preview.compressedSize / 1024 / 1024).toFixed(2)}MB</div>
                    <div>Saved: {preview.compressionRatio}%</div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removePreview(preview.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Storage Usage Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-700">
              <div className="flex justify-between">
                <span>Storage Usage:</span>
                <span>
                  {previews.reduce((sum, p) => sum + p.compressedSize, 0) / 1024 / 1024 < 1
                    ? `${(previews.reduce((sum, p) => sum + p.compressedSize, 0) / 1024).toFixed(0)}KB`
                    : `${(previews.reduce((sum, p) => sum + p.compressedSize, 0) / 1024 / 1024).toFixed(1)}MB`
                  }
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Images are automatically compressed to save storage space
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          <span className="text-sm text-gray-600">Optimizing images...</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImageUpload;
