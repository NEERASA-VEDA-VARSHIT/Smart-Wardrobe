import { useState, useEffect } from 'react';
import { getMySuggestions, acceptSuggestion, rejectSuggestion, listSuggestionComments, addSuggestionComment, deleteSuggestionApi } from '../api';
import { handleApiError, showSuccess } from '../utils/errorHandler';

function OutfitSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [openComments, setOpenComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stylistSearch, setStylistSearch] = useState('');

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const res = await getMySuggestions();
      if (res.success) {
        setSuggestions(res.data);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load outfit suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (suggestionId, feedback = '') => {
    setProcessing(suggestionId);
    try {
      const res = await acceptSuggestion(suggestionId, feedback);
      if (res.success) {
        showSuccess('Suggestion accepted!');
        loadSuggestions(); // Reload to get updated data
      }
    } catch (error) {
      handleApiError(error, 'Failed to accept suggestion');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (suggestionId, feedback = '') => {
    setProcessing(suggestionId);
    try {
      const res = await rejectSuggestion(suggestionId, feedback);
      if (res.success) {
        showSuccess('Suggestion rejected');
        loadSuggestions(); // Reload to get updated data
      }
    } catch (error) {
      handleApiError(error, 'Failed to reject suggestion');
    } finally {
      setProcessing(null);
    }
  };

  const openCommentsFor = async (id) => {
    try {
      setOpenComments(id);
      const res = await listSuggestionComments(id);
      setComments(res.data || []);
    } catch (e) {
      handleApiError(e, 'Failed to load comments');
    }
  };

  const postComment = async () => {
    try {
      if (!newComment.trim() || !openComments) return;
      const res = await addSuggestionComment(openComments, newComment.trim());
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (e) {
      handleApiError(e, 'Failed to post comment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'modified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'modified': return '✏️';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSuggestion = (suggestion) => {
    const isProcessing = processing === suggestion._id;

    return (
      <div key={suggestion._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}`}>
                {getStatusIcon(suggestion.status)} {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Suggested by <span className="font-medium">{suggestion.stylist?.name || 'Unknown'}</span> • {formatDate(suggestion.suggestedAt)}
            </p>
            {suggestion.description && (
              <p className="text-sm text-gray-700 mt-2">{suggestion.description}</p>
            )}
          </div>
        </div>

        {/* Outfit Items */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Outfit Items ({suggestion.items.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {suggestion.items.map((item) => (
              <div key={item._id} className="relative">
                <img
                  src={`http://localhost:8000${item.imageUrl}`}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                  <div className="truncate">{item.name}</div>
                  <div className="text-gray-300 capitalize">{item.type}</div>
                </div>
                
                {/* Item status indicators */}
                {item.worn && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs">
                    👕
                  </div>
                )}
                {item.needsCleaning && (
                  <div className="absolute top-1 left-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                    🧺
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback (if provided) */}
        {suggestion.feedback && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-1">Your Feedback:</h5>
            <p className="text-sm text-gray-600">{suggestion.feedback}</p>
          </div>
        )}

        {/* Action Buttons (only for pending suggestions) */}
        {suggestion.status === 'pending' && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleAccept(suggestion._id)}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : '✅ Accept Suggestion'}
            </button>
            <button
              onClick={() => handleReject(suggestion._id)}
              disabled={isProcessing}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : '❌ Reject Suggestion'}
            </button>
            <button onClick={() => openCommentsFor(suggestion._id)} className="px-4 py-2 rounded-lg font-medium border border-gray-200 hover:bg-gray-50">💬 Comments</button>
          </div>
        )}
        {/* Delete */}
        <div className="mt-2 text-right">
          <button onClick={async () => {
            try { await deleteSuggestionApi(suggestion._id); showSuccess('Suggestion deleted'); loadSuggestions(); }
            catch(e){ handleApiError(e, 'Failed to delete'); }
          }} className="text-xs text-red-600 hover:text-red-700">Delete</button>
        </div>

        {/* Response date (if responded) */}
        {suggestion.respondedAt && (
          <div className="mt-3 text-xs text-gray-500">
            Responded on {formatDate(suggestion.respondedAt)}
          </div>
        )}
      </div>
    );
  };

  const filtered = suggestions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (stylistSearch && !(s.stylist?.name || '').toLowerCase().includes(stylistSearch.toLowerCase())) return false;
    return true;
  });
  const pendingSuggestions = filtered.filter(s => s.status === 'pending');
  const processedSuggestions = filtered.filter(s => s.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Outfit Suggestions</h2>
            <p className="text-gray-600 mt-1">
              Get styling suggestions from friends and family
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input value={stylistSearch} onChange={(e)=>setStylistSearch(e.target.value)} placeholder="Search stylist" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="modified">Modified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Suggestions */}
      {!loading && pendingSuggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Pending Suggestions</h3>
          {pendingSuggestions.map(renderSuggestion)}
        </div>
      )}

      {/* Processed Suggestions */}
      {!loading && processedSuggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Previous Suggestions</h3>
          {processedSuggestions.map(renderSuggestion)}
        </div>
      )}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">👗</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No suggestions yet</h3>
          <p className="text-gray-500">
            Share your wardrobe with friends and family to start receiving outfit suggestions!
          </p>
        </div>
      )}
      {openComments && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-900">Suggestion Comments</div>
              <button onClick={() => setOpenComments(null)} className="text-gray-600">✕</button>
            </div>
            <div className="max-h-64 overflow-auto space-y-2 mb-2">
              {comments.length === 0 ? (
                <div className="text-xs text-gray-500">No comments yet</div>
              ) : (
                comments.map((c) => (
                  <div key={c._id || c.createdAt} className="text-xs">
                    <div className="font-medium text-gray-800">{c.role === 'owner' ? 'You' : 'Stylist'}</div>
                    <div className="text-gray-700 whitespace-pre-wrap">{c.message}</div>
                    <div className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2">
              <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment" className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <button onClick={postComment} className="btn-primary text-sm">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutfitSuggestions;
