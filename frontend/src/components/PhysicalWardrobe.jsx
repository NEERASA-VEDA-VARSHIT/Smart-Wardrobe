import { useState, useEffect } from 'react';

function PhysicalWardrobe({ clothes, onMarkWorn, onToggleWash, onDelete, onItemSelect }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);

  // Categorize clothes by type and placement
  const categorizeClothes = (clothes) => {
    const categories = {
      // Hanger rail items (shirts, jackets, dresses)
      hangerRail: clothes.filter(c => 
        ['shirt', 'blouse', 'dress', 'jacket', 'blazer', 'cardigan', 'sweater'].includes(c.type?.toLowerCase())
      ),
      // Folded shelf items (t-shirts, jeans, casual wear)
      foldedShelf: clothes.filter(c => 
        ['t-shirt', 'tank', 'polo', 'jeans', 'pants', 'shorts', 'trousers'].includes(c.type?.toLowerCase())
      ),
      // Accessories shelf (hats, belts, bags)
      accessoriesShelf: clothes.filter(c => 
        ['hat', 'cap', 'belt', 'bag', 'purse', 'scarf', 'tie'].includes(c.type?.toLowerCase())
      ),
      // Shoe rack (all footwear)
      shoeRack: clothes.filter(c => 
        ['shoes', 'sneakers', 'boots', 'sandals', 'heels', 'flats', 'loafers'].includes(c.type?.toLowerCase())
      )
    };
    return categories;
  };

  const categorizedClothes = categorizeClothes(clothes);

  // Wardrobe opening animation
  useEffect(() => {
    const timer = setTimeout(() => setWardrobeOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleItemClick = (item) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  const handleItemHover = (item) => {
    setHoveredItem(item);
  };

  const handleItemLeave = () => {
    setHoveredItem(null);
  };

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

  const renderHangerItem = (item, index) => (
    <div
      key={item._id}
      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 ${getItemStatusClass(item)}`}
      onClick={() => handleItemClick(item)}
      onMouseEnter={() => handleItemHover(item)}
      onMouseLeave={handleItemLeave}
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: wardrobeOpen ? 'hangerSway 2s ease-in-out infinite' : 'none'
      }}
    >
      {/* Hanger */}
      <div className="relative w-16 h-20 mx-auto">
        {/* Hanger wire */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-8 border-2 border-gray-400 rounded-full"></div>
        {/* Hanger hook */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gray-400"></div>
        
        {/* Clothing item */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-14 h-16 rounded-lg overflow-hidden shadow-md">
          <img
            src={`http://localhost:8000${item.imageUrl}`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Status indicator */}
        {getItemStatusIcon(item) && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
            {getItemStatusIcon(item)}
          </div>
        )}
      </div>
      
      {/* Item name */}
      <div className="text-xs text-center mt-1 text-gray-700 truncate max-w-16">
        {item.name}
      </div>
    </div>
  );

  const renderFoldedItem = (item, index) => (
    <div
      key={item._id}
      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 ${getItemStatusClass(item)}`}
      onClick={() => handleItemClick(item)}
      onMouseEnter={() => handleItemHover(item)}
      onMouseLeave={handleItemLeave}
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: wardrobeOpen ? 'foldedStack 0.5s ease-out' : 'none'
      }}
    >
      {/* Folded stack effect */}
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
        
        {/* Status indicator */}
        {getItemStatusIcon(item) && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
            {getItemStatusIcon(item)}
          </div>
        )}
      </div>
      
      {/* Item name */}
      <div className="text-xs text-center mt-1 text-gray-700 truncate max-w-20">
        {item.name}
      </div>
    </div>
  );

  const renderAccessoryItem = (item, index) => (
    <div
      key={item._id}
      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 ${getItemStatusClass(item)}`}
      onClick={() => handleItemClick(item)}
      onMouseEnter={() => handleItemHover(item)}
      onMouseLeave={handleItemLeave}
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
        
        {/* Status indicator */}
        {getItemStatusIcon(item) && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
            {getItemStatusIcon(item)}
          </div>
        )}
      </div>
      
      {/* Item name */}
      <div className="text-xs text-center mt-1 text-gray-700 truncate max-w-16">
        {item.name}
      </div>
    </div>
  );

  const renderShoeItem = (item, index) => (
    <div
      key={item._id}
      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 ${getItemStatusClass(item)}`}
      onClick={() => handleItemClick(item)}
      onMouseEnter={() => handleItemHover(item)}
      onMouseLeave={handleItemLeave}
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
        
        {/* Status indicator */}
        {getItemStatusIcon(item) && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
            {getItemStatusIcon(item)}
          </div>
        )}
      </div>
      
      {/* Item name */}
      <div className="text-xs text-center mt-1 text-gray-700 truncate max-w-20">
        {item.name}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-amber-50 to-amber-100 min-h-screen p-6">
      {/* Wardrobe Container */}
      <div className="max-w-6xl mx-auto">
        {/* Wardrobe Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">My Wardrobe</h1>
          <p className="text-amber-700">Click on items to interact • Hover to preview</p>
        </div>

        {/* Wardrobe Structure */}
        <div className="bg-gradient-to-b from-amber-200 to-amber-300 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Wardrobe doors opening effect */}
          <div className={`absolute inset-0 bg-amber-800 transition-transform duration-1000 ${wardrobeOpen ? '-translate-x-full' : 'translate-x-0'}`}></div>
          
          {/* Wardrobe Interior */}
          <div className={`relative transition-opacity duration-1000 ${wardrobeOpen ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* Top Accessories Shelf */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-1 bg-amber-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-amber-800">Accessories</h3>
                <div className="flex-1 h-1 bg-amber-600 rounded-full ml-3"></div>
              </div>
              <div className="grid grid-cols-8 gap-4 min-h-20">
                {categorizedClothes.accessoriesShelf.map(renderAccessoryItem)}
                {categorizedClothes.accessoriesShelf.length === 0 && (
                  <div className="col-span-8 flex items-center justify-center text-amber-600 text-sm">
                    No accessories yet
                  </div>
                )}
              </div>
            </div>

            {/* Hanger Rail */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-1 bg-amber-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-amber-800">Hanger Rail</h3>
                <div className="flex-1 h-1 bg-amber-600 rounded-full ml-3"></div>
              </div>
              <div className="bg-amber-400 rounded-lg p-4 shadow-inner">
                <div className="grid grid-cols-12 gap-2 min-h-32">
                  {categorizedClothes.hangerRail.map(renderHangerItem)}
                  {categorizedClothes.hangerRail.length === 0 && (
                    <div className="col-span-12 flex items-center justify-center text-amber-700 text-sm">
                      No hanging items yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Folded Shelf */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-1 bg-amber-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-amber-800">Folded Items</h3>
                <div className="flex-1 h-1 bg-amber-600 rounded-full ml-3"></div>
              </div>
              <div className="grid grid-cols-10 gap-4 min-h-24">
                {categorizedClothes.foldedShelf.map(renderFoldedItem)}
                {categorizedClothes.foldedShelf.length === 0 && (
                  <div className="col-span-10 flex items-center justify-center text-amber-600 text-sm">
                    No folded items yet
                  </div>
                )}
              </div>
            </div>

            {/* Shoe Rack */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-1 bg-amber-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-amber-800">Shoe Rack</h3>
                <div className="flex-1 h-1 bg-amber-600 rounded-full ml-3"></div>
              </div>
              <div className="bg-amber-500 rounded-lg p-4 shadow-inner">
                <div className="grid grid-cols-10 gap-4 min-h-20">
                  {categorizedClothes.shoeRack.map(renderShoeItem)}
                  {categorizedClothes.shoeRack.length === 0 && (
                    <div className="col-span-10 flex items-center justify-center text-amber-700 text-sm">
                      No shoes yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Item Details Panel */}
        {hoveredItem && (
          <div className="fixed top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-xs z-50">
            <div className="flex items-start space-x-3">
              <img
                src={`http://localhost:8000${hoveredItem.imageUrl}`}
                alt={hoveredItem.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{hoveredItem.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{hoveredItem.type} • {hoveredItem.color}</p>
                <p className="text-sm text-gray-500 capitalize">{hoveredItem.occasion || 'casual'}</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => onMarkWorn(hoveredItem._id)}
                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                  >
                    {hoveredItem.worn ? 'Mark Unworn' : 'Mark Worn'}
                  </button>
                  <button
                    onClick={() => onToggleWash(hoveredItem._id)}
                    className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                  >
                    {hoveredItem.needsCleaning ? 'Mark Clean' : 'Mark Dirty'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
      `}</style>
    </div>
  );
}

export default PhysicalWardrobe;
