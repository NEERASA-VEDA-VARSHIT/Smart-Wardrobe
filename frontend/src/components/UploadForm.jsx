function UploadForm({ onAddItem }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get("image");

    const newItem = {
      id: Date.now() + Math.random(), // unique identifier
      name: formData.get("name"),
      image: URL.createObjectURL(file),
      worn: false, // default false
      lastWorn: null, // default null
      washed: true, // default true
    };

    onAddItem(newItem); // pass the item back up to App
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Item Name" required />
      <input type="file" name="image" accept="image/*" required />
      <button type="submit">Add to Wardrobe</button>
    </form>
  );
}

export default UploadForm;
