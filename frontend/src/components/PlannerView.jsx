import { useMemo, useState, useEffect } from 'react';
import WeekCalendar from './WeekCalendar';
import SuggestionLanes from './SuggestionLanes';
import OutfitTray from './OutfitTray';
import { createPlannedOutfitApi, listPlannedOutfitsApi } from '../api';
import { handleApiError, showSuccess } from '../utils/errorHandler';

function PlannerView({ clothes = [], onMarkWorn, onMarkClean, onSelectItem }) {
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [trayItems, setTrayItems] = useState([]);

  const availableClothes = useMemo(
    () => clothes.filter(c => !c.needsCleaning),
    [clothes]
  );

  // planned outfits for the visible week
  const [plannedByDate, setPlannedByDate] = useState({});
  const [plannedForSelected, setPlannedForSelected] = useState([]);

  useEffect(() => {
    const fetchWeek = async () => {
      const start = new Date(selectedDay);
      const day = start.getDay();
      const mondayOffset = ((day + 6) % 7);
      start.setDate(start.getDate() - mondayOffset);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      try {
        const res = await listPlannedOutfitsApi({ from: start.toISOString(), to: end.toISOString() });
        const map = {};
        const sameDay = [];
        res.data?.forEach(doc => {
          const k = new Date(doc.plannedAt).toISOString().slice(0,10);
          map[k] = (map[k] || 0) + 1;
          if (new Date(doc.plannedAt).toDateString() === selectedDay.toDateString()) {
            sameDay.push(doc);
          }
        });
        setPlannedByDate(map);
        setPlannedForSelected(sameDay);
      } catch (e) {
        // non-fatal
      }
    };
    fetchWeek();
  }, [selectedDay]);

  const handleAddToTray = (item) => {
    if (item.needsCleaning) {
      return; // later: prompt to mark clean
    }
    setTrayItems(prev => {
      if (prev.find(p => p._id === item._id)) return prev;
      return [...prev, item];
    });
    onSelectItem?.(item);
  };

  const handleRemoveFromTray = (id) => {
    setTrayItems(prev => prev.filter(p => p._id !== id));
  };

  const handleClearTray = () => setTrayItems([]);

  const handleSaveOutfit = async () => {
    try {
      if (trayItems.length === 0) return;
      const body = {
        items: trayItems.map(t => t._id),
        plannedAt: selectedDay.toISOString(),
        title: 'Planned Outfit',
        occasion: 'casual'
      };
      await createPlannedOutfitApi(body);
      showSuccess('Outfit saved for the selected day');
      handleClearTray();
    } catch (e) {
      handleApiError(e, 'Failed to save planned outfit');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Week calendar */}
        <div className="lg:col-span-4">
          <WeekCalendar selectedDay={selectedDay} onSelectDay={setSelectedDay} plannedCountsByDate={plannedByDate} />
        </div>

        {/* Center: Outfit canvas (simple list for now) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Outfit for {selectedDay.toDateString()}</h3>
            </div>
            {trayItems.length === 0 ? (
              <div className="text-gray-500 text-sm">Add items from suggestions to build your outfit.</div>
            ) : (
              <ul className="space-y-2">
                {trayItems.map(item => (
                  <li key={item._id} className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                    <div className="flex items-center gap-3">
                      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded" />
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{item.type} • {item.color}</div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromTray(item._id)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex items-center gap-2">
              <button onClick={handleSaveOutfit} className="btn-primary text-sm">Save Outfit</button>
              <button onClick={handleClearTray} className="text-sm text-gray-600 hover:text-gray-800">Clear</button>
            </div>
          </div>
          {/* planned items preview for selected day */}
          <div className="mt-4">
            {plannedForSelected.length > 0 && (
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">Already planned for this day</div>
                <ul className="space-y-1">
                  {plannedForSelected.map(p => (
                    <li key={p._id} className="text-xs text-gray-600">{p.items?.length || 0} item outfit • {new Date(p.plannedAt).toLocaleTimeString()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Suggestion lanes */}
        <div className="lg:col-span-3">
          <SuggestionLanes
            clothes={availableClothes}
            onAddToTray={handleAddToTray}
          />
        </div>
      </div>

      <OutfitTray items={trayItems} onRemove={handleRemoveFromTray} onClear={handleClearTray} />
    </div>
  );
}

export default PlannerView;


