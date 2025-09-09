import { useEffect, useState } from 'react';
import { getOutfitRecommendation } from '../api';
import { handleApiError } from '../utils/errorHandler';

function Lane({ title, items = [], onAdd }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
      <div className="text-sm font-semibold text-gray-900 mb-2">{title}</div>
      {items.length === 0 ? (
        <div className="text-xs text-gray-500">No suggestions yet</div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it._id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={it.imageUrl} alt={it.name} className="w-8 h-8 object-cover rounded" />
                <div className="text-xs text-gray-700">
                  <div className="font-medium">{it.name}</div>
                  <div className="capitalize text-gray-500">{it.type}</div>
                </div>
              </div>
              <button className="text-xs text-indigo-600 hover:text-indigo-700" onClick={() => onAdd(it)}>Add</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SuggestionLanes({ clothes = [], onAddToTray }) {
  const [system, setSystem] = useState([]);

  useEffect(() => {
    const fetchReco = async () => {
      try {
        const res = await getOutfitRecommendation({ occasion: 'casual' });
        const items = [res.data?.top, res.data?.bottom, res.data?.optional].filter(Boolean);
        setSystem(items);
      } catch (e) {
        handleApiError(e, 'Failed to load system suggestions');
      }
    };
    fetchReco();
  }, []);

  const favorites = clothes.filter(c => c.favorite);

  return (
    <div className="space-y-3">
      <Lane title="System" items={system} onAdd={onAddToTray} />
      <Lane title="Favorites" items={favorites} onAdd={onAddToTray} />
    </div>
  );
}

export default SuggestionLanes;


