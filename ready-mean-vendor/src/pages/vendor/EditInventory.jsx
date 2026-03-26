import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ImagePlus, X, Scissors, Sparkles, Plus as PlusIcon, ZoomIn, ZoomOut, ArrowLeft, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';


const API_URL = import.meta.env.VITE_API_URL || '/api';
const SAVED_CUTS_KEY = 'vendor_saved_cuts';

export default function EditProduct() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');

  // Cleaning option
  const [cleaningEnabled, setCleaningEnabled] = useState(false);
  const [cleaningCharge, setCleaningCharge] = useState('');

  // Cutting options — dynamic list of { name, charge }
  const [cuttingOptions, setCuttingOptions] = useState([]);

  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);

  // Lightbox states
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { get, put } = useApi();
  const { session } = useAuth();
  const navigate = useNavigate();

  // Load existing product data on mount
  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        const res = await get('/products/' + id);
        if (cancelled) return;
        const product = res.product;

        setName(product.name || '');
        setDescription(product.description || '');
        setPrice(product.price != null ? String(product.price) : '');
        setStockQty(product.stock_qty != null ? String(product.stock_qty) : '');

        // Image
        if (product.image_url) {
          setExistingImageUrl(product.image_url);
        }

        // Cleaning
        if (product.cleaning_charge != null) {
          setCleaningEnabled(true);
          setCleaningCharge(String(product.cleaning_charge));
        }

        // Cutting options
        if (Array.isArray(product.cutting_options) && product.cutting_options.length > 0) {
          setCuttingOptions(
            product.cutting_options.map(c => ({
              name: c.type || '',
              charge: c.charge != null ? String(c.charge) : '',
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load product');
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id, get]);

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
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    setImageChanged(true);
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
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setImageChanged(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name);

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
      let image_url;

      if (imageChanged) {
        if (imageFile) {
          setUploading(true);
          image_url = await uploadImage();
          setUploading(false);
        } else {
          // Image was removed
          image_url = null;
        }
      }

      const cuttingArr = cuttingOptions
        .filter(c => c.name.trim() && c.charge)
        .map(c => ({ type: c.name.trim(), charge: parseFloat(c.charge) }));

      const payload = {
        name,
        description: description || null,
        price: parseFloat(price),
        stock_qty: parseFloat(stockQty) || 0,
        cleaning_charge: cleaningEnabled && cleaningCharge ? parseFloat(cleaningCharge) : null,
        cutting_options: cuttingArr.length > 0 ? cuttingArr : null,
      };

      // Only include image_url in payload if image was changed
      if (imageChanged) {
        payload.image_url = image_url;
      }

      await put('/products/' + id, payload);

      const cutsToSave = cuttingOptions
        .filter(c => c.name.trim())
        .map(c => ({ name: c.name.trim(), charge: c.charge }));
      if (cutsToSave.length > 0) {
        localStorage.setItem(SAVED_CUTS_KEY, JSON.stringify(cutsToSave));
      }

      navigate('/products');
    } catch (err) {
      setUploading(false);
      setError(err.message || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const displayImage = imagePreview || existingImageUrl;

  if (initialLoading) {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500 mb-3" />
          <p className="text-sm text-surface-500">Loading product...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link to="/products" className="p-2 -ml-2 rounded-xl hover:bg-surface-100 active:bg-surface-200 transition-colors">
            <ArrowLeft size={20} className="text-surface-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-surface-900">Edit Product</h1>
            <p className="text-xs text-surface-500 mt-0.5">Update your product details</p>
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

            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-[13px] font-semibold text-surface-600 mb-1.5">
                Product Image
                <span className="ml-1.5 text-[11px] font-normal text-surface-400">ഫോട്ടോ</span>
              </label>
              {displayImage ? (
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-900 group ring-1 ring-surface-200/60 shadow-card">
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="w-full h-full object-cover cursor-zoom-in transition-all duration-300 group-hover:scale-[1.03] group-hover:brightness-95"
                    onClick={openLightbox}
                  />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                  {/* Action buttons — bottom bar */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-3 pt-6">
                    <span className="text-[11px] font-medium text-white/70">Tap to zoom</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-semibold hover:bg-white/30 active:bg-white/40 transition-all ring-1 ring-white/10"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-1.5 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-500 active:bg-red-600 transition-all ring-1 ring-red-400/20"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center text-surface-400 bg-gradient-to-br from-surface-50 to-surface-100 border-2 border-dashed border-surface-200 hover:border-primary-300 hover:from-primary-50/50 hover:to-primary-50/30 hover:text-primary-600 active:from-primary-50 active:to-primary-50/50 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm ring-1 ring-surface-100 flex items-center justify-center mb-3 group-hover:ring-primary-200 group-hover:shadow-md group-hover:shadow-primary-500/10 transition-all duration-300">
                    <ImagePlus size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm font-semibold">Add Product Photo</span>
                  <span className="text-[11px] text-surface-400 mt-0.5 group-hover:text-primary-500 transition-colors">ഫോട്ടോ ചേർക്കുക</span>
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
            <div className="border border-surface-200 rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleaningEnabled}
                  onChange={(e) => setCleaningEnabled(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <Sparkles size={16} className="text-blue-500" />
                <span className="text-sm font-semibold text-surface-900">Cleaning available</span>
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
            <div className="border border-surface-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 mb-1">
                <Scissors size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-surface-900">Cutting options</span>
              </div>
              <p className="text-xs text-surface-500">"Whole Fish" is always available at base price. Add your custom cut types below.</p>
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
                    className="mt-2 p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCuttingOptions(prev => [...prev, { name: '', charge: '' }])}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
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
              {uploading ? 'Uploading image...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Image Lightbox */}
      {showLightbox && displayImage && (
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
              src={displayImage}
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

    </PageLayout>
  );
}
