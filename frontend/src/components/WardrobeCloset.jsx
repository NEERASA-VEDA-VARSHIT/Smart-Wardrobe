import { useState, useEffect } from 'react';

function WardrobeCloset({ clothes, onItemClick, onMarkWorn, onToggleWash, onDelete }) {
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Wardrobe opening animation
  useEffect(() => {
    const timer = setTimeout(() => setWardrobeOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Categorize clothes by type and placement
  const categorizeClothes = (clothes) => {
    const categories = {
      accessories: clothes.filter(c => 
        ['hat', 'cap', 'belt', 'bag', 'purse', 'scarf', 'tie', 'jewelry', 'watch'].includes(c.type?.toLowerCase())
      ),
      hangerRail: clothes.filter(c => 
        ['shirt', 'blouse', 'dress', 'jacket', 'blazer', 'cardigan', 'sweater', 'coat'].includes(c.type?.toLowerCase())
      ),
      foldedShelf: clothes.filter(c => 
        ['t-shirt', 'tank', 'polo', 'jeans', 'pants', 'shorts', 'trousers', 'sweatshirt', 'hoodie'].includes(c.type?.toLowerCase())
      ),
      shoes: clothes.filter(c => 
        ['shoes', 'sneakers', 'boots', 'sandals', 'heels', 'flats', 'loafers', 'slippers'].includes(c.type?.toLowerCase())
      ),
      laundry: clothes.filter(c => c.needsCleaning)
    };
    return categories;
  };

  const categorizedClothes = categorizeClothes(clothes);

  const getItemStatusClass = (item) => {
    if (item.worn) return 'opacity-50 grayscale';
    if (item.needsCleaning) return 'opacity-70 sepia';
    return '';
  };

  const getItemStatusIcon = (item) => {
    if (item.worn) return '👕';
    if (item.needsCleaning) return '🧺';
    return '';
  };

  const renderAccessoriesShelf = () => (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-1 bg-amber-600 rounded-full mr-3"></div>
        <h3 className="text-lg font-semibold text-amber-800">Accessories Shelf</h3>
        <div className="flex-1 h-1 bg-amber-600 rounded-full ml-3"></div>
      </div>
      <div className="grid grid-cols-8 gap-3 min-h-20">
        {categorizedClothes.accessories.map((item, index) => (
          <div
            key={item._id}
            className={`relative group cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 ${getItemStatusClass(item)}`}
            onClick={() => onItemClick(item)}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: wardrobeOpen ? 'accessoryGlow 1s ease-out' : 'none'
            }}
          >
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-full h-full rounded-lg overflow-hidden shadow-md border-2 border-gray-200">
                <img
                  src={`http://localhost:8000${item.imageUrl}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {getItemStatusIcon(item) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
                  {getItemStatusIcon(item)}
                </div>
              )}
            </div>
            <div className="text-xs text-center mt-1 text-gray-700 truncate max-w-16">
              {item.name}
            </div>
          </div>
        ))}
        {categorizedClothes.accessories.length === 0 && (
          <div className="col-span-8 flex items-center justify-center text-amber-600 text-sm">
            No accessories yet
          </div>
        )}
      </div>
    </div>
  );

  const renderHangerRail = () => (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-1 bg-amber-600 rounded-full mr-3"></div>
        <h3 className="text-lg font-semibold text-amber-800">Hanger Rail</h3>
        <div className="flex-1 h-1 bg-amber-600 rounded-full ml-3"></div>
      </div>
      <div className="bg-amber-400 rounded-lg p-4 shadow-inner">
        <div className="flex space-x-4 overflow-x-auto pb-2 min-h-32">
          {categorizedClothes.hangerRail.map((item, index) => (
            <div
              key={item._id}
              className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 flex-shrink-0 ${getItemStatusClass(item)}`}
              onClick={() => onItemClick(item)}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: wardrobeOpen ? 'hangerSway 2s ease-in-out infinite' : 'none'
              }}
            >
              <div className="relative w-16 h-20 mx-auto">
                {/* Hanger */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-8 border-2 border-gray-400 rounded-full"></div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gray-400"></div>
                
                {/* Clothing item */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-14 h-16 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={`http://localhost:8000${item.imageUrl}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {getItemStatusIcon(item) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
                    {getItemStatusIcon(item)}
                  </div>
                )}
              </div>
              <div className="text-xs text-center mt-1 text-gray-700 truncate max-w-16">
                {item.name}
              </div>
            </div>
          ))}
          {categorizedClothes.hangerRail.length === 0 && (
            <div className="flex items-center justify-center text-amber-700 text-sm w-full">
              No hanging items yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFoldedShelf = () => (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-1 bg-amber-600 rounded-full mr-3"></div>
        <h3 className="text-lg font-semibold text-amber-800">Folded Shelf</h3>
        <div className="flex-1 h-1 bg-amber-600 rounded-full ml-3"></div>
      </div>
      <div className="grid grid-cols-10 gap-4 min-h-24">
        {categorizedClothes.foldedShelf.map((item, index) => (
          <div
            key={item._id}
            className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 ${getItemStatusClass(item)}`}
            onClick={() => onItemClick(item)}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: wardrobeOpen ? 'foldedStack 0.5s ease-out' : 'none'
            }}
          >
            <div className="relative w-20 h-16 mx-auto">
              {/* Stack layers */}
              <div className="absolute inset-0 bg-gray-200 rounded-lg shadow-sm"></div>
              <div className="absolute inset-1 bg-gray-100 rounded-lg shadow-sm"></div>
              
              {/* Main item */}
              <div className="absolute inset-2 rounded-lg overflow-hidden shadow-md">
                <img
                  src={`http://localhost:8000${item.imageUrl}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {getItemStatusIcon(item) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
                  {getItemStatusIcon(item)}
                </div>
              )}
            </div>
            <div className="text-xs text-center mt-1 text-gray-700 truncate max-w-20">
              {item.name}
            </div>
          </div>
        ))}
        {categorizedClothes.foldedShelf.length === 0 && (
          <div className="col-span-10 flex items-center justify-center text-amber-600 text-sm">
            No folded items yet
          </div>
        )}
      </div>
    </div>
  );

  const renderShoeRack = () => (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-1 bg-amber-600 rounded-full mr-3"></div>
        <h3 className="text-lg font-semibold text-amber-800">Shoe Rack</h3>
        <div className="flex-1 h-1 bg-amber-600 rounded-full ml-3"></div>
      </div>
      <div className="bg-amber-500 rounded-lg p-4 shadow-inner">
        <div className="flex space-x-4 overflow-x-auto pb-2 min-h-20">
          {categorizedClothes.shoes.map((item, index) => (
            <div
              key={item._id}
              className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 flex-shrink-0 ${getItemStatusClass(item)}`}
              onClick={() => onItemClick(item)}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: wardrobeOpen ? 'shoeSlide 0.8s ease-out' : 'none'
              }}
            >
              <div className="relative w-20 h-12 mx-auto">
                <div className="w-full h-full rounded-lg overflow-hidden shadow-md border border-gray-300">
                  <img
                    src={`http://localhost:8000${item.imageUrl}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {getItemStatusIcon(item) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
                    {getItemStatusIcon(item)}
                  </div>
                )}
              </div>
              <div className="text-xs text-center mt-1 text-gray-700 truncate max-w-20">
                {item.name}
              </div>
            </div>
          ))}
          {categorizedClothes.shoes.length === 0 && (
            <div className="flex items-center justify-center text-amber-700 text-sm w-full">
              No shoes yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLaundryBasket = () => {
    if (categorizedClothes.laundry.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-1 bg-red-600 rounded-full mr-3"></div>
          <h3 className="text-lg font-semibold text-red-800">Laundry Basket</h3>
          <div className="flex-1 h-1 bg-red-600 rounded-full ml-3"></div>
        </div>
        <div className="bg-red-100 rounded-lg p-4 border-2 border-red-200">
          <div className="grid grid-cols-8 gap-3 min-h-20">
            {categorizedClothes.laundry.map((item, index) => (
              <div
                key={item._id}
                className="relative group cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 opacity-70"
                onClick={() => onItemClick(item)}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: wardrobeOpen ? 'laundryBounce 1s ease-out' : 'none'
                }}
              >
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-full h-full rounded-lg overflow-hidden shadow-md border-2 border-red-300">
                    <img
                      src={`http://localhost:8000${item.imageUrl}`}
                      alt={item.name}
                      className="w-full h-full object-cover sepia"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md">
                    🧺
                  </div>
                </div>
                <div className="text-xs text-center mt-1 text-red-700 truncate max-w-16">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-amber-50 to-amber-100 min-h-screen p-6">
      {/* Wardrobe Container */}
      <div className="max-w-6xl mx-auto">
        {/* Wardrobe Structure */}
        <div className="bg-gradient-to-b from-amber-200 to-amber-300 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Wardrobe doors opening effect */}
          <div className={`absolute inset-0 bg-amber-800 transition-transform duration-1000 ${wardrobeOpen ? '-translate-x-full' : 'translate-x-0'}`}></div>
          
          {/* Wardrobe Interior */}
          <div className={`relative transition-opacity duration-1000 ${wardrobeOpen ? 'opacity-100' : 'opacity-0'}`}>
            {renderAccessoriesShelf()}
            {renderHangerRail()}
            {renderFoldedShelf()}
            {renderShoeRack()}
            {renderLaundryBasket()}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes hangerSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        
        @keyframes foldedStack {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes accessoryGlow {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          100% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        }
        
        @keyframes shoeSlide {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes laundryBounce {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default WardrobeCloset;
