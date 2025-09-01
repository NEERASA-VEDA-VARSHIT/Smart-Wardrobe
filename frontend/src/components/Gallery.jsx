import ClothCard from "./ClothCard";

function Gallery({ wardrobe, onToggleWorn, onToggleWash }) {
  return (
    <div>
      <h2>Wardrobe Gallery</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {wardrobe.length === 0 ? (
          <p>No items yet. Add some!</p>
        ) : (
          wardrobe.map((item) => (
            <ClothCard
              key={item.id}
              item={item}
              onToggleWorn={onToggleWorn}
              onToggleWash={onToggleWash}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Gallery