import OutfitManager from '../components/OutfitManager';
import OutfitSuggestions from '../components/OutfitSuggestions';

function OutfitReviewPage() {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Outfit Review</h1>
      </div>
      <OutfitManager />
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Suggested Outfits</h2>
        <OutfitSuggestions />
      </div>
    </div>
  );
}

export default OutfitReviewPage;
