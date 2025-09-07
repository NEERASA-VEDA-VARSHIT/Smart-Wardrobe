import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getWardrobeForStyling } from '../api';
import { handleApiError } from '../utils/errorHandler';
import StylistDashboard from '../components/StylistDashboard';

function StylistPage() {
  const { ownerId } = useParams();
  const [ownerName, setOwnerName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOwnerInfo();
  }, [ownerId]);

  const loadOwnerInfo = async () => {
    setLoading(true);
    try {
      // First, try to get wardrobe to check access
      const res = await getWardrobeForStyling(ownerId);
      if (res.success) {
        // If successful, we have access - get owner name from the first item
        // For now, we'll use a placeholder. In a real app, you'd get this from user data
        setOwnerName('Wardrobe Owner');
        setError(null);
      }
    } catch (error) {
      setError('You do not have permission to view this wardrobe or the wardrobe does not exist.');
      handleApiError(error, 'Failed to access wardrobe');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading stylist dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StylistDashboard ownerId={ownerId} ownerName={ownerName} />
    </div>
  );
}

export default StylistPage;
