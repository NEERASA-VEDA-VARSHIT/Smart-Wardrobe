import ClothCard from "./ClothCard";

function Gallery({ clothes, onMarkWorn, onToggleWash, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Wardrobe Gallery ({clothes.length} items)</h2>
      
      {(!clothes || clothes.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👔</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">Your wardrobe is empty</h3>
          <p className="text-gray-500">Add your first clothing item to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clothes.map((cloth) => (
            <ClothCard
              key={cloth._id}
              cloth={cloth}
              onMarkWorn={onMarkWorn}
              onToggleWash={onToggleWash}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Gallery