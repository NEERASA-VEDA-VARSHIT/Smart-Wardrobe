function ClothCard({ item, onToggleWorn, onToggleWash }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "Never worn";
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        minWidth: "200px",
      }}
    >
      <img
        src={item.image}
        alt={item.name}
        style={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />
      <h3 style={{ margin: "10px 0 5px 0" }}>{item.name}</h3>

      <div style={{ marginBottom: "10px" }}>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Status:</strong> {item.worn ? "Worn" : "Not worn"}
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Last worn:</strong> {formatDate(item.lastWorn)}
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Wash status:</strong>{" "}
          {item.washed ? "Clean" : "Needs washing"}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={() => onToggleWorn(item.id)}
          style={{
            padding: "8px 12px",
            backgroundColor: item.worn ? "#4CAF50" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {item.worn ? "Mark as Not Worn" : "Mark as Worn"}
        </button>

        <button
          onClick={() => onToggleWash(item.id)}
          style={{
            padding: "8px 12px",
            backgroundColor: item.washed ? "#FF9800" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {item.washed ? "Mark as Needs Washing" : "Mark as Clean"}
        </button>
      </div>
    </div>
  );
}

export default ClothCard;
