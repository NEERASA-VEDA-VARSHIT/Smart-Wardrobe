import { Cloth } from '../models/Cloth.js';

// Get outfit recommendation based on occasion and user preferences
export const getOutfitRecommendation = async (req, res) => {
  try {
    const { occasion = 'casual', userId } = req.body;
    const ownerId = req.user.id;

    // Get all available clothes (not worn today, not needing cleaning)
    const availableClothes = await Cloth.find({
      userId: ownerId,
      worn: false,
      needsCleaning: false
    }).sort({ lastWorn: 1 }); // Sort by least recently worn first

    if (availableClothes.length === 0) {
      return res.json({
        success: true,
        data: {
          recommendation: null,
          message: 'No available clothes for recommendation. All items are either worn or need cleaning.'
        }
      });
    }

    // Filter by occasion if specified
    const occasionFiltered = availableClothes.filter(cloth => 
      !cloth.occasion || cloth.occasion === occasion || cloth.occasion === 'any'
    );

    // If no occasion-specific items, use all available
    const clothesToUse = occasionFiltered.length > 0 ? occasionFiltered : availableClothes;

    // Categorize clothes by type
    const categorized = {
      tops: clothesToUse.filter(c => ['shirt', 'blouse', 't-shirt', 'sweater', 'tank', 'polo'].includes(c.type?.toLowerCase())),
      bottoms: clothesToUse.filter(c => ['pants', 'jeans', 'shorts', 'skirt', 'trousers'].includes(c.type?.toLowerCase())),
      outerwear: clothesToUse.filter(c => ['jacket', 'blazer', 'cardigan', 'hoodie', 'coat'].includes(c.type?.toLowerCase())),
      shoes: clothesToUse.filter(c => ['shoes', 'sneakers', 'boots', 'sandals', 'heels'].includes(c.type?.toLowerCase())),
      accessories: clothesToUse.filter(c => ['hat', 'scarf', 'belt', 'bag'].includes(c.type?.toLowerCase()))
    };

    // Generate recommendation using smart matching
    const recommendation = generateSmartRecommendation(categorized, occasion);

    if (!recommendation) {
      return res.json({
        success: true,
        data: {
          recommendation: null,
          message: 'Unable to generate a complete outfit recommendation with available items.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        recommendation,
        occasion,
        reasoning: generateReasoningText(recommendation, occasion)
      }
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendation'
    });
  }
};

// Smart recommendation algorithm
function generateSmartRecommendation(categorized, occasion) {
  const recommendation = {
    top: null,
    bottom: null,
    outerwear: null,
    shoes: null,
    accessories: [],
    confidence: 0
  };

  let confidence = 0;

  // 1. Select top (required)
  if (categorized.tops.length > 0) {
    recommendation.top = selectBestItem(categorized.tops, occasion);
    confidence += 40;
  }

  // 2. Select bottom (required)
  if (categorized.bottoms.length > 0) {
    recommendation.bottom = selectBestItem(categorized.bottoms, occasion);
    confidence += 40;
  }

  // 3. Select outerwear (optional, based on occasion)
  if (categorized.outerwear.length > 0 && shouldIncludeOuterwear(occasion)) {
    recommendation.outerwear = selectBestItem(categorized.outerwear, occasion);
    confidence += 10;
  }

  // 4. Select shoes (optional)
  if (categorized.shoes.length > 0) {
    recommendation.shoes = selectBestItem(categorized.shoes, occasion);
    confidence += 10;
  }

  // 5. Select accessories (optional, max 2)
  if (categorized.accessories.length > 0) {
    const selectedAccessories = selectAccessories(categorized.accessories, occasion, 2);
    recommendation.accessories = selectedAccessories;
    confidence += Math.min(selectedAccessories.length * 5, 10);
  }

  // Apply color coordination
  const colorCoordinated = applyColorCoordination(recommendation);
  if (colorCoordinated) {
    confidence += 10;
  }

  recommendation.confidence = Math.min(confidence, 100);

  // Only return if we have at least top and bottom
  if (recommendation.top && recommendation.bottom) {
    return recommendation;
  }

  return null;
}

// Select best item from category based on recency and occasion
function selectBestItem(items, occasion) {
  if (items.length === 0) return null;

  // Sort by least recently worn first, then by occasion match
  return items.sort((a, b) => {
    // First priority: occasion match
    const aOccasionMatch = a.occasion === occasion ? 1 : 0;
    const bOccasionMatch = b.occasion === occasion ? 1 : 0;
    
    if (aOccasionMatch !== bOccasionMatch) {
      return bOccasionMatch - aOccasionMatch;
    }

    // Second priority: least recently worn
    const aLastWorn = a.lastWorn ? new Date(a.lastWorn) : new Date(0);
    const bLastWorn = b.lastWorn ? new Date(b.lastWorn) : new Date(0);
    
    return aLastWorn - bLastWorn;
  })[0];
}

// Select accessories (max count)
function selectAccessories(accessories, occasion, maxCount) {
  return accessories
    .sort((a, b) => {
      // Prioritize occasion match
      const aOccasionMatch = a.occasion === occasion ? 1 : 0;
      const bOccasionMatch = b.occasion === occasion ? 1 : 0;
      return bOccasionMatch - aOccasionMatch;
    })
    .slice(0, maxCount);
}

// Determine if outerwear should be included
function shouldIncludeOuterwear(occasion) {
  const formalOccasions = ['work', 'business', 'formal', 'interview'];
  const coldWeatherOccasions = ['winter', 'cold'];
  
  return formalOccasions.includes(occasion) || coldWeatherOccasions.includes(occasion);
}

// Apply basic color coordination rules
function applyColorCoordination(recommendation) {
  const items = [recommendation.top, recommendation.bottom, recommendation.outerwear, recommendation.shoes]
    .filter(item => item !== null);

  if (items.length < 2) return true;

  // Basic color coordination rules
  const neutralColors = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'brown'];
  const warmColors = ['red', 'orange', 'yellow', 'pink'];
  const coolColors = ['blue', 'green', 'purple'];

  // Check for color clashes
  const colors = items.map(item => item.color?.toLowerCase()).filter(Boolean);
  
  // Avoid too many bright colors
  const brightColors = colors.filter(color => 
    warmColors.includes(color) || coolColors.includes(color)
  );
  
  if (brightColors.length > 2) {
    // Try to replace one bright item with neutral
    return false;
  }

  // Check for complementary colors
  const hasNeutral = colors.some(color => neutralColors.includes(color));
  if (!hasNeutral && colors.length > 2) {
    // Prefer at least one neutral item
    return false;
  }

  return true;
}

// Generate reasoning text for the recommendation
function generateReasoningText(recommendation, occasion) {
  const reasons = [];

  if (recommendation.top && recommendation.bottom) {
    reasons.push(`Selected ${recommendation.top.name} and ${recommendation.bottom.name} for a complete ${occasion} look`);
  }

  if (recommendation.outerwear) {
    reasons.push(`Added ${recommendation.outerwear.name} for extra style`);
  }

  if (recommendation.shoes) {
    reasons.push(`Paired with ${recommendation.shoes.name} for the perfect finish`);
  }

  if (recommendation.accessories.length > 0) {
    const accessoryNames = recommendation.accessories.map(a => a.name).join(', ');
    reasons.push(`Accessorized with ${accessoryNames}`);
  }

  // Add color coordination note
  const items = [recommendation.top, recommendation.bottom, recommendation.outerwear, recommendation.shoes]
    .filter(item => item !== null);
  const colors = items.map(item => item.color).filter(Boolean);
  
  if (colors.length > 1) {
    reasons.push(`Color-coordinated with ${colors.join(', ')}`);
  }

  return reasons.join('. ') + '.';
}

// Get recommendation history for learning
export const getRecommendationHistory = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    // This would typically come from a RecommendationHistory model
    // For now, return basic stats
    const stats = await Cloth.aggregate([
      { $match: { userId: ownerId } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          availableItems: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$worn', false] }, { $eq: ['$needsCleaning', false] }] },
                1,
                0
              ]
            }
          },
          mostWornType: { $first: '$type' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || { totalItems: 0, availableItems: 0, mostWornType: null }
    });

  } catch (error) {
    console.error('Recommendation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation history'
    });
  }
};
