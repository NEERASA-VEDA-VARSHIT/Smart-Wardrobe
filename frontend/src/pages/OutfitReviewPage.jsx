import OutfitManager from '../components/OutfitManager';

function OutfitReviewPage() {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Outfit Review</h1>
      </div>
      <OutfitManager />
    </div>
  );
}

export default OutfitReviewPage;
