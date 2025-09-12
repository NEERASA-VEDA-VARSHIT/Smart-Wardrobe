import { useState, useRef } from 'react';

function UploadForm({ onAddItem, isSubmitting = false }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [manualFirst, setManualFirst] = useState(false);
  const formRef = useRef(null);

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

  const handleSubmit = async (e, manualFlag) => {
    e?.preventDefault?.();
    const form = formRef.current || (e?.currentTarget?.closest ? e.currentTarget.closest('form') : e?.currentTarget) || e?.currentTarget || e?.target;
    const fileInput = form?.querySelector('input[name="image"]');
    const originalFile = fileInput?.files?.[0];
    if (!originalFile) return;

    // Client-side compression to ~1280px JPEG, quality ~0.82
    const compressImage = (file) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
            resolve(compressed);
          },
          'image/jpeg',
          0.82
        );
      };
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result; };
      reader.readAsDataURL(file);
    });

    const compressedFile = await compressImage(originalFile).catch(() => originalFile);

    const formData = new FormData();
    formData.append('image', compressedFile);
    if (manualFlag) formData.append('manualFirst', 'true');
    await onAddItem(formData);
    form.reset();
    setImagePreview(null);
  };

  const handleSubmitAI = (e) => handleSubmit(e, false);
  const handleSubmitManual = (e) => handleSubmit(e, true);

  return (
    <div className="card animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Clothing Item</h2>
      {/* Minimal upload-only form. Choose AI analysis or Manual first. */}
      <form ref={formRef} onSubmit={handleSubmitAI} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            required 
            onChange={handleImageChange}
            className="input-field"
            disabled={isSubmitting}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            type="submit" 
            className="w-full btn-primary disabled:opacity-60"
            disabled={isSubmitting}
            onClick={() => setManualFirst(false)}
          >
            {isSubmitting ? 'Analyzing…' : 'Analyze with AI'}
          </button>
          <button 
            type="button" 
            className="w-full btn-secondary disabled:opacity-60"
            disabled={isSubmitting}
            onClick={handleSubmitManual}
          >
            {isSubmitting ? 'Preparing…' : 'Enter Manually'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadForm;
