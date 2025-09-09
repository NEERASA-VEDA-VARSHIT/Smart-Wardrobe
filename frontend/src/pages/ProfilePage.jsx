import { useEffect, useState } from 'react';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = decodeJwt(token || '') || null;
    setUser(u);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Profile</h1>
        <p className="text-gray-600">Your account details and settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">User ID</span>
              <span className="font-mono text-sm text-gray-900">{user.id || user._id || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email</span>
              <span className="text-gray-900">{user.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Name</span>
              <span className="text-gray-900">{user.name || '—'}</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">You're not logged in. Please sign in to view your profile.</div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;


