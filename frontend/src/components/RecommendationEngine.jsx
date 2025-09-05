import { useState, useMemo } from 'react';

function RecommendationEngine({ clothes }) {
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [showRecommendations, setShowRecommendations] = useState(false);

  const recommendations = useMemo(() => {
    if (!clothes.length) return [];

    const cleanClothes = clothes.filter(c => !c.needsCleaning);
    const notRecentlyWorn = cleanClothes.filter(c => {
      if (!c.lastWorn) return true;
      const daysSinceWorn = (Date.now() - new Date(c.lastWorn).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceWorn >= 3;
    });

    // Basic color matching rules
    const colorGroups = {
      neutral: ['black', 'white', 'gray', 'beige', 'navy', 'brown'],
      warm: ['red', 'orange', 'yellow', 'pink', 'coral'],
      cool: ['blue', 'green', 'purple', 'teal', 'mint']
    };

    const getColorGroup = (color) => {
      const lowerColor = color.toLowerCase();
      for (const [group, colors] of Object.entries(colorGroups)) {
        if (colors.some(c => lowerColor.includes(c))) return group;
      }
      return 'neutral';
    };

    // Generate outfit combinations
    const outfits = [];
    const tops = notRecentlyWorn.filter(c => ['shirt', 'blouse', 'tank', 'sweater'].includes(c.type));
    const bottoms = notRecentlyWorn.filter(c => ['pants', 'jeans', 'shorts', 'skirt'].includes(c.type));
    const shoes = notRecentlyWorn.filter(c => c.type === 'shoes');
    const accessories = notRecentlyWorn.filter(c => c.type === 'accessory');

    // Create combinations with color matching
    tops.forEach(top => {
      bottoms.forEach(bottom => {
        const topColorGroup = getColorGroup(top.color);
        const bottomColorGroup = getColorGroup(bottom.color);
        
        // Good color combinations
        const isGoodMatch = 
          topColorGroup === 'neutral' || 
          bottomColorGroup === 'neutral' ||
          topColorGroup === bottomColorGroup ||
          (topColorGroup === 'warm' && bottomColorGroup === 'cool') ||
          (topColorGroup === 'cool' && bottomColorGroup === 'warm');

        if (isGoodMatch) {
          const outfit = {
            id: `${top._id}-${bottom._id}`,
            items: [top, bottom],
            score: 0
          };

          // Add shoes if available
          if (shoes.length > 0) {
            const matchingShoes = shoes.filter(shoe => 
              getColorGroup(shoe.color) === 'neutral' || 
              getColorGroup(shoe.color) === topColorGroup ||
              getColorGroup(shoe.color) === bottomColorGroup
            );
            if (matchingShoes.length > 0) {
              outfit.items.push(matchingShoes[0]);
            }
          }

          // Add accessories if available
          if (accessories.length > 0) {
            const matchingAccessories = accessories.filter(acc => 
              getColorGroup(acc.color) === 'neutral' || 
              getColorGroup(acc.color) === topColorGroup
            );
            if (matchingAccessories.length > 0) {
              outfit.items.push(matchingAccessories[0]);
            }
          }

          // Calculate score based on occasion match and color harmony
          outfit.score = 50; // Base score
          if (top.occasion === selectedOccasion) outfit.score += 20;
          if (bottom.occasion === selectedOccasion) outfit.score += 20;
          if (isGoodMatch) outfit.score += 10;

          outfits.push(outfit);
        }
      });
    });

    return outfits
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // Top 6 recommendations
  }, [clothes, selectedOccasion]);

  const occasions = ['casual', 'formal', 'party', 'workout', 'business', 'date', 'travel'];

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">🤖 Outfit Recommendations</h2>
        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="btn-primary text-sm"
        >
          {showRecommendations ? 'Hide' : 'Show'} Recommendations
        </button>
      </div>

      {showRecommendations && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Occasion</label>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="select-field"
            >
              {occasions.map(occasion => (
                <option key={occasion} value={occasion}>{occasion}</option>
              ))}
            </select>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">👔</div>
              <p>No recommendations available</p>
              <p className="text-sm">Add more clothes or try a different occasion</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((outfit, index) => (
                <div key={outfit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">Outfit #{index + 1}</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                      {outfit.score}% match
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {outfit.items.map((item, itemIndex) => (
                      <div key={item._id} className="flex items-center gap-2 text-sm">
                        <img 
                          src={`http://localhost:8000${item.imageUrl}`} 
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-gray-500 text-xs">
                            {item.type} • {item.color}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Perfect for: {selectedOccasion}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RecommendationEngine;
