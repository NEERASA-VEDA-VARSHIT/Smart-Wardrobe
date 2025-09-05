import { useState, useEffect } from 'react';
import { getMyOutfits, updateOutfitStatus } from '../api';
import { handleApiError, showSuccess } from '../utils/errorHandler';

function OutfitManager() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, suggested, accepted, rejected

  const loadOutfits = async () => {
    setLoading(true);
    try {
      const res = await getMyOutfits();
      setOutfits(res.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load outfits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutfits();
  }, []);

  const handleStatusUpdate = async (outfitId, status, notes = '') => {
    try {
      const res = await updateOutfitStatus(outfitId, status, notes);
      setOutfits(prev => prev.map(outfit => 
        outfit._id === outfitId ? res.data : outfit
      ));
      showSuccess(`Outfit ${status} successfully!`);
    } catch (error) {
      handleApiError(error, 'Failed to update outfit');
    }
  };

  const filteredOutfits = outfits.filter(outfit => {
    if (filter === 'all') return true;
    return outfit.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'suggested': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'suggested': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">👔 Outfit Suggestions</h2>
        <button
          onClick={loadOutfits}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', count: outfits.length },
          { key: 'suggested', label: 'Suggested', count: outfits.filter(o => o.status === 'suggested').length },
          { key: 'accepted', label: 'Accepted', count: outfits.filter(o => o.status === 'accepted').length },
          { key: 'rejected', label: 'Rejected', count: outfits.filter(o => o.status === 'rejected').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading outfits...</div>
        </div>
      ) : filteredOutfits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">👔</div>
          <p className="text-lg">No outfits found</p>
          <p className="text-sm">Ask a friend to suggest an outfit for you!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutfits.map(outfit => (
            <div key={outfit._id} className="card animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{outfit.name}</h3>
                  {outfit.description && (
                    <p className="text-gray-600 text-sm mt-1">{outfit.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(outfit.status)}`}>
                  {getStatusIcon(outfit.status)} {outfit.status}
                </span>
              </div>

              {/* Outfit Items */}
              <div className="space-y-2 mb-4">
                <div className="text-sm font-medium text-gray-700">Items:</div>
                <div className="grid grid-cols-2 gap-2">
                  {outfit.clothIds.map(item => (
                    <div key={item._id} className="flex items-center gap-2">
                      <img 
                        src={`http://localhost:8000${item.imageUrl}`} 
                        alt={item.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <div className="text-xs">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-gray-500">{item.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes and Info */}
              {outfit.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="text-yellow-800 text-sm">
                    <strong>Stylist notes:</strong> {outfit.notes}
                  </div>
                </div>
              )}

              {outfit.ownerNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <div className="text-blue-800 text-sm">
                    <strong>Your notes:</strong> {outfit.ownerNotes}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <div>Suggested by: {outfit.createdBy?.name || 'Unknown'}</div>
                <div>Suggested for: {formatDate(outfit.suggestedFor)}</div>
                <div>Created: {formatDate(outfit.createdAt)}</div>
                {outfit.acceptedAt && <div>Accepted: {formatDate(outfit.acceptedAt)}</div>}
                {outfit.rejectedAt && <div>Rejected: {formatDate(outfit.rejectedAt)}</div>}
              </div>

              {/* Actions */}
              {outfit.status === 'suggested' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const notes = prompt('Add notes (optional):');
                        handleStatusUpdate(outfit._id, 'accepted', notes);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 text-sm"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Why are you rejecting this outfit? (optional):');
                        handleStatusUpdate(outfit._id, 'rejected', notes);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 text-sm"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OutfitManager;
