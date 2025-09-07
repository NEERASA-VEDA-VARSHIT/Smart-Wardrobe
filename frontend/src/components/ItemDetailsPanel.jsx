import { useState } from 'react';

function ItemDetailsPanel({ selectedItem, onMarkWorn, onToggleWash, onDelete, onAddToOutfit }) {
  const [showActions, setShowActions] = useState(false);

  if (!selectedItem) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg p-6 h-fit">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👗</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Select an Item</h3>
          <p className="text-gray-500 text-sm">
            Click on any clothing item to view details and manage it
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Never worn";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "Today";
      if (diffDays === 2) return "Yesterday";
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      return date.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = () => {
    if (selectedItem.worn) return "bg-yellow-100 text-yellow-800";
    if (selectedItem.needsCleaning) return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = () => {
    if (selectedItem.worn) return "Currently Worn";
    if (selectedItem.needsCleaning) return "Needs Cleaning";
    return "Clean & Ready";
  };

  const getStatusIcon = () => {
    if (selectedItem.worn) return "👕";
    if (selectedItem.needsCleaning) return "🧺";
    return "✅";
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Item Image */}
      <div className="relative mb-4">
        <img
          src={`http://localhost:8000${selectedItem.imageUrl}`}
          alt={selectedItem.name}
          className="w-full h-64 object-cover rounded-lg shadow-md"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusIcon()} {getStatusText()}
        </div>
      </div>

      {/* Item Information */}
      <div className="space-y-3 mb-6">
        <div>
          <h4 className="text-xl font-semibold text-gray-900">{selectedItem.name}</h4>
          <p className="text-gray-600 capitalize">{selectedItem.type}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Color:</span>
            <p className="font-medium text-gray-900 capitalize">{selectedItem.color}</p>
          </div>
          <div>
            <span className="text-gray-500">Occasion:</span>
            <p className="font-medium text-gray-900 capitalize">{selectedItem.occasion || 'casual'}</p>
          </div>
        </div>

        <div>
          <span className="text-gray-500 text-sm">Last Worn:</span>
          <p className="font-medium text-gray-900">{formatDate(selectedItem.lastWorn)}</p>
        </div>

        <div>
          <span className="text-gray-500 text-sm">Wash Status:</span>
          <p className={`font-medium ${!selectedItem.needsCleaning ? 'text-green-600' : 'text-red-600'}`}>
            {!selectedItem.needsCleaning ? 'Clean' : 'Needs washing'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-700">Quick Actions</h5>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onMarkWorn(selectedItem._id)}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedItem.worn
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <span>{selectedItem.worn ? '✓' : '👕'}</span>
            <span>{selectedItem.worn ? 'Mark Unworn' : 'Mark Worn'}</span>
          </button>
          
          <button
            onClick={() => onToggleWash(selectedItem._id)}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedItem.needsCleaning
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <span>{selectedItem.needsCleaning ? '✨' : '🧺'}</span>
            <span>{selectedItem.needsCleaning ? 'Mark Clean' : 'Mark Dirty'}</span>
          </button>
        </div>

        <button
          onClick={() => onAddToOutfit(selectedItem)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          <span>👗</span>
          <span>Add to Outfit</span>
        </button>
      </div>

      {/* Extended Actions */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <h5 className="text-sm font-medium text-gray-700">More Actions</h5>
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                onDelete(selectedItem._id);
              }
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <span>🗑️</span>
            <span>Delete Item</span>
          </button>
        </div>
      )}

      {/* Item Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Item Statistics</h5>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Added:</span>
            <span>{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span>{new Date(selectedItem.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Times Worn:</span>
            <span>{selectedItem.lastWorn ? '1+' : '0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetailsPanel;
