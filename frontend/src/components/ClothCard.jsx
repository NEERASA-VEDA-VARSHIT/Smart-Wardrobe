function ClothCard({ cloth, onMarkWorn, onToggleWash, onDelete }) {
  const formatDate = (value) => {
    if (!value) return "Never worn";
    try { 
      const date = new Date(value);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "Today";
      if (diffDays === 2) return "Yesterday";
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      return date.toLocaleDateString();
    } catch { return "Invalid date"; }
  };

  const getStatusColor = () => {
    if (cloth.worn) return "bg-yellow-100 text-yellow-800"; // Currently being worn
    if (cloth.needsCleaning) return "bg-red-100 text-red-800"; // Needs cleaning
    return "bg-green-100 text-green-800"; // Clean and ready
  };

  const getStatusText = () => {
    if (cloth.worn) return "Currently Worn";
    if (cloth.needsCleaning) return "Needs Cleaning";
    return "Clean & Ready";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="relative">
        <img
          src={`http://localhost:8000${cloth.imageUrl}`}
          alt={cloth.name}
          className="w-full h-48 object-cover"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this item?')) {
              onDelete(cloth._id);
            }
          }}
          className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-80 hover:opacity-100"
          title="Delete item"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-lg">{cloth.name}</h3>
        
        {/* Item Details */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="text-gray-800 capitalize">{cloth.type}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Color:</span>
            <span className="text-gray-800 capitalize">{cloth.color}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Occasion:</span>
            <span className="text-gray-800 capitalize">{cloth.occasion || 'casual'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Last Worn:</span>
            <span className="text-gray-800">{formatDate(cloth.lastWorn)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Wash Status:</span>
            <span className={`font-medium ${cloth.washed ? 'text-green-600' : 'text-red-600'}`}>
              {cloth.washed ? 'Clean' : 'Needs washing'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onMarkWorn(cloth._id)}
            className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              cloth.worn
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'btn-primary'
            }`}
          >
            {cloth.worn ? '✓ Mark as Not Worn' : '👕 Mark as Worn Today'}
          </button>
          
          <button
            onClick={() => onToggleWash(cloth._id)}
            className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              cloth.needsCleaning
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {cloth.needsCleaning ? '✨ Mark as Cleaned' : '🧺 Mark as Needs Cleaning'}
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                onDelete(cloth._id);
              }
            }}
            className="w-full btn-danger text-sm"
          >
            🗑️ Delete Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClothCard;
