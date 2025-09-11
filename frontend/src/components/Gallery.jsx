import { memo, useMemo } from 'react';
import ClothCard from "./ClothCard";
import VirtualizedList from "./VirtualizedList";

const Gallery = memo(({ clothes, onMarkWorn, onToggleWash, onDelete }) => {
  const renderItem = useMemo(() => (cloth, index) => (
    <div key={cloth._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
      <ClothCard
        cloth={cloth}
        onMarkWorn={onMarkWorn}
        onToggleWash={onToggleWash}
        onDelete={onDelete}
      />
    </div>
  ), [onMarkWorn, onToggleWash, onDelete]);

  return (
    <div className="card animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Wardrobe Gallery ({clothes.length} items)</h2>
      
      {(!clothes || clothes.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👔</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">Your wardrobe is empty</h3>
          <p className="text-gray-500">Add your first clothing item to get started!</p>
        </div>
      ) : clothes.length > 50 ? (
        <VirtualizedList
          items={clothes}
          itemHeight={300}
          containerHeight={600}
          renderItem={renderItem}
          className="w-full"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clothes.map((cloth, index) => renderItem(cloth, index))}
        </div>
      )}
    </div>
  );
});

Gallery.displayName = 'Gallery';

export default Gallery;