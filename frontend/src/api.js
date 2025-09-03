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

async function handle(res) {
  const data = await res.json();
  if (!res.ok) {
    // If unauthorized, clear token and redirect to login
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

// Authentication API
export function register(userData) {
  return fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }).then(handle);
}

export function login(credentials) {
  return fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then(handle);
}

export function getProfile() {
  return fetch(`${BASE_URL}/auth/profile`, {
    headers: getAuthHeaders(),
  }).then(handle);
}

export function updateProfile(userData) {
  return fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(userData),
  }).then(handle);
}

// Clothes API (with images) - now requires authentication
export function getClothes() {
  const headers = getAuthHeaders();
  return fetch(`${BASE_URL}/clothes`, {
    headers: headers,
  }).then(handle);
}

export function createCloth(formData) {
  return fetch(`${BASE_URL}/clothes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData, // FormData for file upload
  }).then(handle);
}

export function updateCloth(id, formData) {
  return fetch(`${BASE_URL}/clothes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  }).then(handle);
}

export function deleteCloth(id) {
  return fetch(`${BASE_URL}/clothes/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(handle);
}

// Items API (text-only, for learning)
export function getItems() {
  return fetch(`${BASE_URL}/items`).then(handle);
}

export function createItem(item) {
  return fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }).then(handle);
}

export function updateItem(id, updates) {
  return fetch(`${BASE_URL}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).then(handle);
}

export function deleteItem(id) {
  return fetch(`${BASE_URL}/items/${id}`, { method: 'DELETE' }).then(handle);
}
