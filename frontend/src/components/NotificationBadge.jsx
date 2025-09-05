import { useState, useEffect } from 'react';
import { getUnreadCount } from '../api';

function NotificationBadge({ onClick }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const res = await getUnreadCount();
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <button
        onClick={onClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 1 1 15 0v5z"
        />
      </svg>
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

export default NotificationBadge;
