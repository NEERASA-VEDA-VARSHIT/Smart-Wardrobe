const BASE_URL = 'http://localhost:8000';

// Get token from localStorage
function getAuthToken() {
  return localStorage.getItem('token');
}

// Get headers with authorization
function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Enhanced API response handler
async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (error) {
    const text = await res.text();
    throw new Error(`Server error (${res.status}): ${res.statusText}`);
  }
  
  if (!res.ok) {
    if (res.status === 401) {
      // Attempt refresh token flow if available
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !res._retried) {
        const refreshed = await tryRefreshToken(refreshToken);
        if (refreshed) {
          // Mark response as retried and rethrow to trigger outer retry
          res._retried = true;
          throw new Error('RETRY_AFTER_REFRESH');
        }
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };
  
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }
  
  // Basic retry with backoff for transient errors
  const maxRetries = 2;
  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, config);
      return await handleResponse(response);
    } catch (e) {
      if (e.message === 'RETRY_AFTER_REFRESH') {
        // Token refreshed. Update headers and retry immediately.
        const existingHeaders = config.headers || {};
        const authHeaders = getAuthHeaders();
        config.headers = { ...existingHeaders, ...authHeaders };
        // Ensure Content-Type remains for JSON bodies
        if (typeof config.body === 'string' && !('Content-Type' in config.headers)) {
          config.headers['Content-Type'] = 'application/json';
        }
        attempt++;
        continue;
      }
      // Retry on network errors / 5xx
      const retriable = e.name === 'TypeError' || /5\d\d/.test(e.message);
      if (attempt < maxRetries && retriable) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1))); // backoff
        attempt++;
        lastError = e;
        continue;
      }
      throw e;
    }
  }
  throw lastError || new Error('Network error');
}

// Store tokens after login/register
export function storeAuthTokens(accessToken, refreshToken, user) {
  if (accessToken) localStorage.setItem('token', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

async function tryRefreshToken(refreshToken) {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken })
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.success && data.accessToken) {
      localStorage.setItem('token', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Authentication API
export function register(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

export function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export function getProfile() {
  return apiRequest('/auth/profile');
}

export function updateProfile(userData) {
  return apiRequest('/auth/profile', {
    method: 'PUT',
    body: userData,
  });
}

// Clothes API (with images) - now requires authentication
export function getClothes(filters = {}) {
  const queryParams = new URLSearchParams();
  
  // Add filters to query string
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const url = queryParams.toString() 
    ? `/clothes?${queryParams.toString()}`
    : '/clothes';

  return apiRequest(url);
}

export function createCloth(formData) {
  return apiRequest('/clothes', {
    method: 'POST',
    body: formData, // FormData for file upload
  });
}

export function updateCloth(id, formData) {
  return apiRequest(`/clothes/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

// Metadata draft (image + minimal fields) → returns draft metadata only
export function createMetadataDraft(formData) {
  return apiRequest('/clothes/metadata-draft', {
    method: 'POST',
    body: formData,
  });
}

// Confirm metadata: send final fields and image to persist + embed
export function confirmClothMetadata(formData) {
  const embed = formData.get('embed') === 'true';
  const endpoint = embed ? '/clothes/confirm?embed=true' : '/clothes/confirm';
  return apiRequest(endpoint, {
    method: 'POST',
    body: formData,
  });
}

export function regenerateEmbedding(itemId) {
  return apiRequest(`/clothes/${itemId}/embed`, {
    method: 'POST'
  });
}

export function vectorSearch(queryText, filter = {}, limit = 10) {
  return apiRequest('/clothes/search-vector', {
    method: 'POST',
    body: { queryText, filter, limit }
  });
}

export function deleteCloth(id) {
  return apiRequest(`/clothes/${id}`, { 
    method: 'DELETE',
  });
}

// PATCH for minimal updates (e.g., toggle worn/needsCleaning)
export function patchCloth(id, updates) {
  return apiRequest(`/clothes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Bulk update multiple clothes at once
export function bulkUpdateClothes(updates) {
  return apiRequest('/clothes/bulk', {
    method: 'PATCH',
    body: JSON.stringify({ updates }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}


// Collaboration API
export function listShares() {
  return apiRequest('/shares');
}

export function inviteShare(email) {
  return apiRequest('/shares/invite', {
    method: 'POST',
    body: { email }
  });
}

export function acceptShare(code) {
  return apiRequest('/shares/accept', {
    method: 'POST',
    body: { code }
  });
}

export function getSharedClothes(ownerId) {
  return apiRequest(`/shared/${ownerId}/clothes`);
}

export function getSharedOutfits(ownerId) {
  return apiRequest(`/shared/${ownerId}/outfits`);
}

export function createSharedOutfit(ownerId, payload) {
  return apiRequest(`/shared/${ownerId}/outfits`, {
    method: 'POST',
    body: payload
  });
}

// Wardrobe Sharing API
export function shareWardrobe(friendEmail, permission = 'viewer') {
  return apiRequest('/wardrobe/share', {
    method: 'POST',
    body: { friendEmail, permission }
  });
}

export function getSharedWardrobes() {
  return apiRequest('/wardrobe/shared');
}

export function getSharedWardrobe(ownerId) {
  return apiRequest(`/wardrobe/shared/${ownerId}`);
}

export function unshareWardrobe(friendId) {
  return apiRequest(`/wardrobe/unshare/${friendId}`, {
    method: 'DELETE',
  });
}

// Outfit Management API
export function getMyOutfits() {
  return apiRequest('/shared/my/outfits');
}

export function updateOutfitStatus(outfitId, status, ownerNotes) {
  return apiRequest(`/shared/outfits/${outfitId}`, {
    method: 'PATCH',
    body: { status, ownerNotes }
  });
}

// Notification API
export function getNotifications(limit = 50, offset = 0) {
  return apiRequest(`/notifications?limit=${limit}&offset=${offset}`);
}

export function getUnreadCount() {
  return apiRequest('/notifications/unread-count');
}

export function markNotificationAsRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsAsRead() {
  return apiRequest('/notifications/read-all', {
    method: 'PATCH',
  });
}

// Recommendation API functions
export function getOutfitRecommendation(occasion = 'casual') {
  return apiRequest('/recommendations/outfit', {
    method: 'POST',
    body: { occasion }
  });
}

export function getRecommendationHistory() {
  return apiRequest('/recommendations/history');
}

// Outfit Suggestion API functions
export function getMySuggestions() {
  return apiRequest('/suggestions/my-suggestions');
}

export function getMyCreatedSuggestions() {
  return apiRequest('/suggestions/my-created');
}

export function createSuggestion(suggestionData) {
  return apiRequest('/suggestions/create', {
    method: 'POST',
    body: suggestionData
  });
}

export function acceptSuggestion(suggestionId, feedback = '') {
  return apiRequest(`/suggestions/${suggestionId}/accept`, {
    method: 'PATCH',
    body: { feedback }
  });
}

export function rejectSuggestion(suggestionId, feedback = '') {
  return apiRequest(`/suggestions/${suggestionId}/reject`, {
    method: 'PATCH',
    body: { feedback }
  });
}

export function deleteSuggestionApi(suggestionId) {
  return apiRequest(`/suggestions/${suggestionId}`, { method: 'DELETE' });
}

export function getWardrobeForStyling(ownerId) {
  return apiRequest(`/suggestions/wardrobe/${ownerId}`);
}

export function getSuggestionStats() {
  return apiRequest('/suggestions/stats');
}

// Planner API
export function createPlannedOutfitApi(body) {
  return apiRequest('/suggestions/planner', {
    method: 'POST',
    body
  });
}

export function listPlannedOutfitsApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = '/suggestions/planner' + (query ? `?${query}` : '');
  return apiRequest(url);
}

// Suggestion comments
export function listSuggestionComments(suggestionId) {
  return apiRequest(`/suggestions/${suggestionId}/comments`);
}

export function addSuggestionComment(suggestionId, message) {
  return apiRequest(`/suggestions/${suggestionId}/comments`, {
    method: 'POST',
    body: { message }
  });
}

// Collections
export function listCollections() {
  return apiRequest('/collections');
}

export function saveCollection(data) {
  return apiRequest('/collections', { method: 'POST', body: data });
}

export function inviteToCollection(id, emails) {
  return apiRequest(`/collections/${id}/invite`, { method: 'POST', body: { emails } });
}

export function listInvitedCollections() {
  return apiRequest('/collections/invited/mine');
}

// Single collection and delete
export function getCollectionById(id) {
  return apiRequest(`/collections/${id}`);
}

export function deleteCollectionById(id) {
  return apiRequest(`/collections/${id}`, { method: 'DELETE' });
}
