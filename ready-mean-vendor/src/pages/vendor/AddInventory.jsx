import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ImagePlus, X, Check, Scissors, Sparkles, Plus as PlusIcon, ZoomIn, ZoomOut, ArrowLeft } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';


const API_URL = import.meta.env.VITE_API_URL || '/api';
const SAVED_CUTS_KEY = 'vendor_saved_cuts';

// Crop the image using canvas
async function getCroppedBlob(imageSrc, croppedAreaPixels) {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
  });
}

export default function AddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');

  // Cleaning option
  const [cleaningEnabled, setCleaningEnabled] = useState(false);
  const [cleaningCharge, setCleaningCharge] = useState('');

  // Cutting options — dynamic list of { name, charge }
  const [cuttingOptions, setCuttingOptions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_CUTS_KEY));
      if (Array.isArray(saved) && saved.length > 0) {
        return saved.map(c => ({ name: c.name || '', charge: c.charge || '' }));
      }
    } catch {}
    return [];
  });

  // Image states
  const [rawImage, setRawImage] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Lightbox states
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { post } = useApi();
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError('');
    const url = URL.createObjectURL(file);
    setRawImage(url);
    setShowCropper(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropDone = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedBlob(rawImage, croppedAreaPixels);
      setCroppedBlob(blob);
      if (croppedPreview) URL.revokeObjectURL(croppedPreview);
      setCroppedPreview(URL.createObjectURL(blob));
      setShowCropper(false);
    } catch (err) {
      console.error('Crop failed:', err);
      setError('Failed to crop image');
    }
  };

  const openLightbox = () => {
    setLightboxZoom(1);
    setLightboxPos({ x: 0, y: 0 });
    setShowLightbox(true);
  };

  const handleLightboxPointerDown = (e) => {
    if (lightboxZoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - lightboxPos.x, y: e.clientY - lightboxPos.y });
  };

  const handleLightboxPointerMove = (e) => {
    if (!dragging) return;
    setLightboxPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleLightboxPointerUp = () => setDragging(false);

  const removeImage = () => {
    if (rawImage) URL.revokeObjectURL(rawImage);
    if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    setRawImage(null);
    setCroppedBlob(null);
    setCroppedPreview(null);
    setShowCropper(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async () => {
    if (!croppedBlob) return null;

    const formData = new FormData();
    formData.append('image', croppedBlob, 'product.jpg');

    const res = await fetch(`${API_URL}/products/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload image');
    }

    const data = await res.json();
    return data.image_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !stockQty) {
      setError('Fish name, price and stock quantity are required');
      return;
    }

    setError('');
    setLoading(true);
    try {
      let image_url = null;
      if (croppedBlob) {
        setUploading(true);
        image_url = await uploadImage();
        setUploading(false);
      }

      const cuttingArr = cuttingOptions
        .filter(c => c.name.trim() && c.charge)
        .map(c => ({ type: c.name.trim(), charge: parseFloat(c.charge) }));

      await post('/products', {
        name,
        description: description || null,
        image_url,
        price: parseFloat(price),
        stock_qty: parseFloat(stockQty) || 0,
        cleaning_charge: cleaningEnabled && cleaningCharge ? parseFloat(cleaningCharge) : null,
        cutting_options: cuttingArr.length > 0 ? cuttingArr : null,
      });

      const cutsToSave = cuttingOptions
        .filter(c => c.name.trim())
        .map(c => ({ name: c.name.trim(), charge: c.charge }));
      if (cutsToSave.length > 0) {
        localStorage.setItem(SAVED_CUTS_KEY, JSON.stringify(cutsToSave));
      }

      navigate('/products');
    } catch (err) {
      setUploading(false);
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link to="/products" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add Product</h1>
            <p className="text-xs text-gray-500 mt-0.5">Add a new fish product to your store</p>
          </div>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <Input
                label="Fish Name"
                placeholder="e.g. King Fish, Pomfret"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
                <textarea
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-base bg-gray-50/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image (optional)</label>
              {croppedPreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 group ring-1 ring-gray-200/60">
                  <img
                    src={croppedPreview}
                    alt="Preview"
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.02]"
                    onClick={openLightbox}
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowCropper(true)}
                      className="px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium hover:bg-black/70 transition-colors"
                    >
                      Re-crop
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all duration-200"
                >
                  <ImagePlus size={28} />
                  <span className="text-xs font-medium mt-1.5">Tap to add image</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price per kg"
                type="number"
                step="0.5"
                min="0"
                placeholder="₹ 450"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Input
                label="Stock (kg)"
                type="number"
                step="0.5"
                min="0"
                placeholder="25"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
              />
            </div>

            {/* Cleaning Option */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleaningEnabled}
                  onChange={(e) => setCleaningEnabled(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Sparkles size={16} className="text-blue-500" />
                <span className="text-sm font-semibold text-gray-900">Cleaning available</span>
              </label>
              {cleaningEnabled && (
                <Input
                  label="Cleaning charge (INR/kg)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 40"
                  value={cleaningCharge}
                  onChange={(e) => setCleaningCharge(e.target.value)}
                />
              )}
            </div>

            {/* Cutting Options */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 mb-1">
                <Scissors size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-gray-900">Cutting options</span>
              </div>
              <p className="text-xs text-gray-500">"Whole Fish" is always available at base price. Add your custom cut types below.</p>
              {cuttingOptions.map((cut, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Cut name (e.g. Steaks)"
                      value={cut.name}
                      onChange={(e) =>
                        setCuttingOptions(prev => prev.map((c, i) => i === idx ? { ...c, name: e.target.value } : c))
                      }
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="₹/kg"
                      value={cut.charge}
                      onChange={(e) =>
                        setCuttingOptions(prev => prev.map((c, i) => i === idx ? { ...c, charge: e.target.value } : c))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCuttingOptions(prev => prev.filter((_, i) => i !== idx))}
                    className="mt-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCuttingOptions(prev => [...prev, { name: '', charge: '' }])}
                className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                <PlusIcon size={15} />
                Add cut type
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {uploading ? 'Uploading image...' : 'Add Product'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Image Lightbox */}
      {showLightbox && croppedPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLightbox(false); }}
        >
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
            <span className="text-white/70 text-sm font-medium">Product Preview</span>
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="w-full h-full flex items-center justify-center overflow-hidden select-none"
            onPointerDown={handleLightboxPointerDown}
            onPointerMove={handleLightboxPointerMove}
            onPointerUp={handleLightboxPointerUp}
            onPointerLeave={handleLightboxPointerUp}
            style={{ touchAction: 'none' }}
          >
            <img
              src={croppedPreview}
              alt="Product zoom"
              className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${lightboxZoom}) translate(${lightboxPos.x / lightboxZoom}px, ${lightboxPos.y / lightboxZoom}px)`,
                cursor: lightboxZoom > 1 ? 'grab' : 'default',
              }}
              draggable={false}
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
            <button
              type="button"
              onClick={() => { setLightboxZoom(z => Math.max(1, z - 0.5)); setLightboxPos({ x: 0, y: 0 }); }}
              disabled={lightboxZoom <= 1}
              className="p-1.5 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-white text-sm font-medium min-w-[3rem] text-center">{Math.round(lightboxZoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setLightboxZoom(z => Math.min(3, z + 0.5))}
              disabled={lightboxZoom >= 3}
              className="p-1.5 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropper && rawImage && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={rawImage}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="bg-black p-4 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <div className="flex items-center gap-3">
              <span className="text-white text-xs w-12">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowCropper(false); if (!croppedBlob) removeImage(); }}
                className="flex-1 py-3 rounded-xl bg-gray-700 text-white text-sm font-semibold active:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropDone}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:bg-emerald-700 transition-colors"
              >
                <Check size={18} />
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
