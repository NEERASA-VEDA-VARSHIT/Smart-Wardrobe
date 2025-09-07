import { useState } from 'react';

function WardrobeViewSwitcher({ currentView, onViewChange }) {
  const views = [
    {
      id: 'physical',
      name: 'Physical Wardrobe',
      icon: '👁️',
      description: 'Realistic closet experience'
    },
    {
      id: 'cards',
      name: 'Card View',
      icon: '⊞',
      description: 'Traditional grid layout'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Wardrobe View</h3>
          <p className="text-sm text-gray-600">Choose how you want to browse your wardrobe</p>
        </div>
        
        <div className="flex space-x-2">
          {views.map((view) => {
            const isActive = currentView === view.id;
            
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={view.description}
              >
                <span className="text-lg">{view.icon}</span>
                <span className="font-medium">{view.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WardrobeViewSwitcher;
