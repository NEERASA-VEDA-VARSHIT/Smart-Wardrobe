import { useState, useRef } from 'react';

function OutfitBuilder({ clothes, onSaveOutfit, onCancel }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [suggestedFor, setSuggestedFor] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  const handleDragStart = (e, cloth) => {
    e.dataTransfer.setData('application/json', JSON.stringify(cloth));
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    try {
      const cloth = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Check if item is already selected
      if (selectedItems.find(item => item._id === cloth._id)) {
        return;
      }

      // Check if item is already worn
      if (cloth.worn) {
        alert(`${cloth.name} is currently being worn and cannot be added to outfit`);
        return;
      }

      setSelectedItems(prev => [...prev, cloth]);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const removeItem = (clothId) => {
    setSelectedItems(prev => prev.filter(item => item._id !== clothId));
  };

  const handleSave = () => {
    if (!outfitName.trim()) {
      alert('Please enter an outfit name');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Please select at least one item for the outfit');
      return;
    }

    const outfitData = {
      name: outfitName,
      description,
      clothIds: selectedItems.map(item => item._id),
      notes,
      suggestedFor: suggestedFor || undefined
    };

    onSaveOutfit(outfitData);
  };

  const getWarnings = () => {
    const warnings = [];
    selectedItems.forEach(item => {
      if (item.needsCleaning) {
        warnings.push(`${item.name} needs cleaning before use`);
      }
    });
    return warnings;
  };

  const warnings = getWarnings();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">✨ Build Outfit</h2>
          <p className="text-gray-600 text-sm mt-1">Drag clothes from the catalog to build an outfit</p>
        </div>

        <div className="flex h-[70vh]">
          {/* Clothes Catalog */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-700 mb-3">Available Clothes</h3>
              <div className="grid grid-cols-2 gap-3">
                {clothes.map(cloth => (
                  <div
                    key={cloth._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cloth)}
                    className={`p-3 border rounded-lg cursor-move hover:shadow-md transition-shadow ${
                      cloth.worn ? 'opacity-50 bg-gray-100' : 'bg-white'
                    }`}
                  >
                    <img 
                      src={`http://localhost:8000${cloth.imageUrl}`} 
                      alt={cloth.name}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <div className="text-sm">
                      <div className="font-medium truncate">{cloth.name}</div>
                      <div className="text-gray-500 text-xs">
                        {cloth.type} • {cloth.color}
                      </div>
                      {cloth.worn && (
                        <div className="text-red-500 text-xs">Currently worn</div>
                      )}
                      {cloth.needsCleaning && (
                        <div className="text-orange-500 text-xs">Needs cleaning</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outfit Builder */}
          <div className="w-1/2 flex flex-col">
            {/* Drop Zone */}
            <div
              ref={dragRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`flex-1 p-4 border-2 border-dashed rounded-lg m-4 transition-colors ${
                isDragging 
                  ? 'border-indigo-400 bg-indigo-50' 
                  : 'border-gray-300'
              }`}
            >
              <div className="text-center text-gray-500 mb-4">
                <div className="text-4xl mb-2">👔</div>
                <p>Drop clothes here to build your outfit</p>
              </div>

              {/* Selected Items */}
              <div className="space-y-2">
                {selectedItems.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <img 
                      src={`http://localhost:8000${item.imageUrl}`} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-gray-500 text-xs">
                        {item.type} • {item.color}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Outfit Details */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outfit Name *
                </label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g., Casual Friday Look"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Perfect for a casual day out"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes for Owner
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., This shirt needs ironing before wearing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suggested For
                </label>
                <input
                  type="date"
                  value={suggestedFor}
                  onChange={(e) => setSuggestedFor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <div className="text-orange-800 text-sm font-medium mb-1">⚠️ Warnings:</div>
                  <ul className="text-orange-700 text-sm space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={!outfitName.trim() || selectedItems.length === 0}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ✨ Save Outfit
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutfitBuilder;
