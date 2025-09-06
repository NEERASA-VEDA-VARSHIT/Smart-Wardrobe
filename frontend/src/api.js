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
      localStorage.removeItem('token');
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
  
  const response = await fetch(url, config);
  return handleResponse(response);
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
export function getClothes() {
  return apiRequest('/clothes');
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

export function deleteCloth(id) {
  return apiRequest(`/clothes/${id}`, { 
    method: 'DELETE',
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
