import { useState } from 'react';

function UploadForm({ onAddItem }) {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onAddItem(formData);
    e.target.reset();
    setImagePreview(null);
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Clothing Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
          <input 
            type="text" 
            name="name" 
            placeholder="e.g., Blue Jeans, White T-Shirt" 
            required 
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select 
            name="type" 
            required 
            className="select-field"
          >
            <option value="">Select type...</option>
            <option value="shirt">Shirt</option>
            <option value="pants">Pants</option>
            <option value="jacket">Jacket</option>
            <option value="shoes">Shoes</option>
            <option value="dress">Dress</option>
            <option value="accessory">Accessory</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <input 
            type="text" 
            name="color" 
            placeholder="e.g., Blue, Red, Black" 
            required 
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
          <select 
            name="occasion" 
            className="select-field"
            defaultValue="casual"
          >
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="party">Party</option>
            <option value="workout">Workout</option>
            <option value="business">Business</option>
            <option value="date">Date Night</option>
            <option value="travel">Travel</option>
            <option value="beach">Beach</option>
            <option value="winter">Winter</option>
            <option value="summer">Summer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            required 
            onChange={handleImageChange}
            className="input-field"
          />
          
          {imagePreview && (
            <div className="mt-4 animate-slide-up">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full btn-primary"
        >
          Add to Wardrobe
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
