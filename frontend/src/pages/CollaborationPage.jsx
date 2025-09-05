import { lazy, Suspense } from 'react';

const Collaboration = lazy(() => import('../components/Collaboration'));

function CollaborationPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaboration</h1>
        <p className="text-gray-600">Share your wardrobe with friends and create outfits together</p>
      </div>

      <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse">Loading collaboration tools...</div></div>}>
        <Collaboration />
      </Suspense>
    </div>
  );
}

export default CollaborationPage;
