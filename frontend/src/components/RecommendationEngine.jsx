import { useState, useEffect } from 'react';
import { getOutfitRecommendation } from '../api';
import { handleApiError, showSuccess } from '../utils/errorHandler';

const OCCASIONS = [
  { value: 'casual', label: 'Casual', icon: '👕' },
  { value: 'work', label: 'Work', icon: '👔' },
  { value: 'party', label: 'Party', icon: '🎉' },
  { value: 'formal', label: 'Formal', icon: '🤵' },
  { value: 'sport', label: 'Sport', icon: '🏃' },
  { value: 'date', label: 'Date', icon: '💕' },
  { value: 'travel', label: 'Travel', icon: '✈️' }
];

function RecommendationEngine({ clothes = [] }) {
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Clear recommendation when clothes change (e.g., when items are marked as worn/clean)
  useEffect(() => {
    setRecommendation(null);
  }, [clothes]);

  const handleGetRecommendation = async () => {
    setLoading(true);
    try {
      const res = await getOutfitRecommendation(selectedOccasion);
      if (res.success) {
        setRecommendation(res.data);
        if (res.data.recommendation) {
          showSuccess('Outfit recommendation generated!');
        }
      }
    } catch (error) {
      handleApiError(error, 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  const renderClothingItem = (item, label) => {
    if (!item) return null;

    return (
      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
        <img 
          src={`http://localhost:8000${item.imageUrl}`} 
          alt={item.name}
          className="w-12 h-12 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">
            {item.type} • {item.color}
            {item.occasion && item.occasion !== 'any' && ` • ${item.occasion}`}
          </div>
        </div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    );
  };

  const availableItems = clothes.filter(c => !c.worn && !c.needsCleaning).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            🤖 Smart Recommendations
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({availableItems} available items)
            </span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Get AI-powered outfit suggestions based on your wardrobe
          </p>
        </div>
        <button
          onClick={handleGetRecommendation}
          disabled={loading || availableItems < 2}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Get Recommendation'
          )}
        </button>
      </div>

      {/* Occasion Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Occasion
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {OCCASIONS.map((occasion) => (
            <button
              key={occasion.value}
              onClick={() => setSelectedOccasion(occasion.value)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedOccasion === occasion.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-1">{occasion.icon}</span>
              <span className="text-xs font-medium">{occasion.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Display */}
      {recommendation && (
        <div className="space-y-4">
          {recommendation.recommendation ? (
            <>
              {/* Recommendation Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">System Recommendation</h4>
                    <p className="text-sm text-gray-600">
                      {selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1)} outfit
                      {recommendation.confidence && (
                        <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                          {recommendation.confidence}% confidence
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {/* Outfit Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderClothingItem(recommendation.recommendation.top, 'Top')}
                {renderClothingItem(recommendation.recommendation.bottom, 'Bottom')}
                {recommendation.recommendation.outerwear && 
                  renderClothingItem(recommendation.recommendation.outerwear, 'Outerwear')
                }
                {recommendation.recommendation.shoes && 
                  renderClothingItem(recommendation.recommendation.shoes, 'Shoes')
                }
              </div>

              {/* Accessories */}
              {recommendation.recommendation.accessories && recommendation.recommendation.accessories.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Accessories</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {recommendation.recommendation.accessories.map((accessory, index) => 
                      renderClothingItem(accessory, `Accessory ${index + 1}`)
                    )}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {showDetails && recommendation.reasoning && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Why this combination?</h5>
                  <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button className="btn-primary flex-1">
                  ✅ Accept Recommendation
                </button>
                <button 
                  onClick={() => setRecommendation(null)}
                  className="btn-secondary flex-1"
                >
                  ❌ Try Different
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😔</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Recommendation Available</h4>
              <p className="text-gray-600 mb-4">{recommendation.message}</p>
              <button
                onClick={handleGetRecommendation}
                className="btn-secondary"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!recommendation && availableItems >= 2 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">💡</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Selects items that aren't worn or dirty</li>
                <li>Prioritizes least recently worn items</li>
                <li>Matches colors and styles for the occasion</li>
                <li>Considers your personal preferences</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Items Warning */}
      {availableItems < 2 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2">⚠️</span>
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Need more items for recommendations</p>
              <p>Add at least 2 clean, unworn items to get outfit suggestions.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendationEngine;