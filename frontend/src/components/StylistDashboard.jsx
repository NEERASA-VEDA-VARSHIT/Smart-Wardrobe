import { useState, useEffect } from 'react';
import { getWardrobeForStyling, createSuggestion } from '../api';
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

function StylistDashboard({ ownerId, ownerName }) {
  const [clothes, setClothes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');

  useEffect(() => {
    loadWardrobe();
  }, [ownerId]);

  const loadWardrobe = async () => {
    setLoading(true);
    try {
      const res = await getWardrobeForStyling(ownerId);
      if (res.success) {
        setClothes(res.data);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected._id === item._id);
      if (isSelected) {
        return prev.filter(selected => selected._id !== item._id);
      } else {
        return [...prev, item];
      }
    });
  };

  const createOutfitSuggestion = async () => {
    if (selectedItems.length === 0) {
      handleApiError(new Error('Please select at least one item for the outfit'));
      return;
    }

    setSaving(true);
    try {
      const suggestionData = {
        ownerId,
        items: selectedItems.map(item => item._id),
        title: suggestionTitle || `${selectedOccasion} outfit suggestion`,
        description: suggestionDescription,
        occasion: selectedOccasion
      };

      const res = await createSuggestion(suggestionData);
      if (res.success) {
        showSuccess('Outfit suggestion created successfully!');
        setSelectedItems([]);
        setSuggestionTitle('');
        setSuggestionDescription('');
        setSelectedOccasion('casual');
      }
    } catch (error) {
      handleApiError(error, 'Failed to create outfit suggestion');
    } finally {
      setSaving(false);
    }
  };

  const categorizeClothes = (clothes) => {
    const categories = {
      tops: clothes.filter(c => ['shirt', 'blouse', 't-shirt', 'sweater', 'tank', 'polo'].includes(c.type?.toLowerCase())),
      bottoms: clothes.filter(c => ['pants', 'jeans', 'shorts', 'skirt', 'trousers'].includes(c.type?.toLowerCase())),
      outerwear: clothes.filter(c => ['jacket', 'blazer', 'cardigan', 'hoodie', 'coat'].includes(c.type?.toLowerCase())),
      shoes: clothes.filter(c => ['shoes', 'sneakers', 'boots', 'sandals', 'heels'].includes(c.type?.toLowerCase())),
      accessories: clothes.filter(c => ['hat', 'scarf', 'belt', 'bag'].includes(c.type?.toLowerCase())),
      other: clothes.filter(c => !['shirt', 'blouse', 't-shirt', 'sweater', 'tank', 'polo', 'pants', 'jeans', 'shorts', 'skirt', 'trousers', 'jacket', 'blazer', 'cardigan', 'hoodie', 'coat', 'shoes', 'sneakers', 'boots', 'sandals', 'heels', 'hat', 'scarf', 'belt', 'bag'].includes(c.type?.toLowerCase()))
    };
    return categories;
  };

  const renderClothingItem = (item) => {
    const isSelected = selectedItems.some(selected => selected._id === item._id);
    const isUnavailable = item.worn || item.needsCleaning;

    return (
      <div
        key={item._id}
        onClick={() => !isUnavailable && toggleItemSelection(item)}
        className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
            : isUnavailable
            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <img
          src={`http://localhost:8000${item.imageUrl}`}
          alt={item.name}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            ✓
          </div>
        )}
        
        {/* Unavailable indicator */}
        {isUnavailable && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
            ✕
          </div>
        )}
        
        <div className="p-3">
          <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
          <p className="text-xs text-gray-500 capitalize">{item.type} • {item.color}</p>
          {item.occasion && item.occasion !== 'any' && (
            <p className="text-xs text-gray-400 capitalize">{item.occasion}</p>
          )}
        </div>
      </div>
    );
  };

  const categorizedClothes = categorizeClothes(clothes);
  const availableClothes = clothes.filter(c => !c.worn && !c.needsCleaning);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stylist Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Creating outfit suggestions for <span className="font-semibold">{ownerName}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Available Items</div>
            <div className="text-2xl font-bold text-indigo-600">{availableClothes.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wardrobe Items */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            Object.entries(categorizedClothes).map(([category, items]) => {
              if (items.length === 0) return null;
              
              return (
                <div key={category} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                    {category} ({items.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map(renderClothingItem)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Suggestion Panel */}
        <div className="space-y-6">
          {/* Selected Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Items ({selectedItems.length})
            </h3>
            
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-sm">Click on items to select them for your outfit suggestion</p>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div key={item._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <img
                      src={`http://localhost:8000${item.imageUrl}`}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                    </div>
                    <button
                      onClick={() => toggleItemSelection(item)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestion Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestion Details</h3>
            
            {/* Occasion Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
              <div className="grid grid-cols-2 gap-2">
                {OCCASIONS.map((occasion) => (
                  <button
                    key={occasion.value}
                    onClick={() => setSelectedOccasion(occasion.value)}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-200 ${
                      selectedOccasion === occasion.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg mb-1">{occasion.icon}</span>
                    <span className="text-xs font-medium">{occasion.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={suggestionTitle}
                onChange={(e) => setSuggestionTitle(e.target.value)}
                placeholder="e.g., Perfect for a date night"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                value={suggestionDescription}
                onChange={(e) => setSuggestionDescription(e.target.value)}
                placeholder="Add any styling notes or tips..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Create Suggestion Button */}
            <button
              onClick={createOutfitSuggestion}
              disabled={selectedItems.length === 0 || saving}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Outfit Suggestion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StylistDashboard;
