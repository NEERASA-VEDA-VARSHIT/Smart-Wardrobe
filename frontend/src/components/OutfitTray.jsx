function OutfitTray({ items = [], onRemove, onClear }) {
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200 px-4 py-3 z-40">
      <div className="flex items-center gap-3">
        {items.map(it => (
          <div key={it._id} className="flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1">
            <img src={it.imageUrl} alt={it.name} className="w-8 h-8 object-cover rounded" />
            <span className="text-xs text-gray-700">{it.name}</span>
            <button className="text-xs text-red-600" onClick={() => onRemove(it._id)}>×</button>
          </div>
        ))}
        <button className="text-sm text-gray-600 hover:text-gray-800" onClick={onClear}>Clear</button>
      </div>
    </div>
  );
}

export default OutfitTray;


