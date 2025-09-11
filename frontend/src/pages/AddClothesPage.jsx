import { lazy, Suspense, useEffect, useState } from 'react';
import { getClothes, createCloth } from '../api';
import { getImageUrl, getImageAlt } from '../utils/imageUtils';
import { handleApiError } from '../utils/errorHandler';
import OptimizedImageUpload from '../components/OptimizedImageUpload';
import StorageMonitor from '../components/StorageMonitor';

const UploadForm = lazy(() => import('../components/UploadForm'));

function AddClothesPage() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadClothes = async () => {
    setLoading(true);
    try {
      const res = await getClothes();
      setClothes(res.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClothes();
  }, []);

  const addCloth = async (formData) => {
    try {
      const res = await createCloth(formData);
      setClothes((prev) => [...prev, res.data]);
    } catch (error) {
      handleApiError(error, 'Failed to add item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Clothes</h1>
            <p className="text-gray-600">Upload photos and details of your clothing items to build your digital wardrobe</p>
          </div>
          <button 
            onClick={loadClothes}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Stats'}
          </button>
        </div>
      </div>

      {/* Upload Form */}
      <Suspense fallback={
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        <UploadForm onAddItem={addCloth} />
      </Suspense>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Wardrobe Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600">{clothes.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Items</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {clothes.filter(c => !c.worn).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Available</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {clothes.filter(c => c.needsCleaning).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Needs Cleaning</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {clothes.filter(c => c.worn).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Currently Worn</div>
          </div>
        </div>
      </div>

      {/* Recent Additions */}
      {clothes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Additions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {clothes.slice(0, 6).map((cloth) => (
              <div key={cloth._id} className="text-center">
                <img 
                  src={getImageUrl(cloth.imageUrl)} 
                  alt={getImageAlt(cloth)}
                  className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                />
                <div className="text-xs text-gray-600 truncate">{cloth.name}</div>
                <div className="text-xs text-gray-500">{cloth.type}</div>
              </div>
            ))}
          </div>
          {clothes.length > 6 && (
            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">
                And {clothes.length - 6} more items in your wardrobe
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Recommendation */}
      {clothes.length >= 2 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              🤖 Ready for Recommendations!
            </h3>
            <a 
              href="/" 
              className="btn-primary text-sm"
            >
              Get Outfit Suggestions →
            </a>
          </div>
          <p className="text-sm text-gray-600">
            You have enough items in your wardrobe to get smart outfit recommendations. 
            Visit the Wardrobe page to try our AI-powered styling suggestions!
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">💡 Tips for Better Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="text-indigo-500 mr-2">📸</span>
            <span>Take photos in good lighting with a plain background for best results</span>
          </div>
          <div className="flex items-start">
            <span className="text-indigo-500 mr-2">🏷️</span>
            <span>Be specific with colors and types to help with outfit recommendations</span>
          </div>
          <div className="flex items-start">
            <span className="text-indigo-500 mr-2">📅</span>
            <span>Add occasion tags to help organize items for different events</span>
          </div>
          <div className="flex items-start">
            <span className="text-indigo-500 mr-2">🔄</span>
            <span>Update item status when you wear or wash them for accurate tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddClothesPage;
