import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, X, Check, Scissors, Sparkles, Plus as PlusIcon, ZoomIn, ZoomOut, ArrowLeft, Camera, Image as GalleryIcon, ChevronDown } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FISH_NAMES, CUTTING_TYPES } from '../../shared/fishData';


const API_URL = import.meta.env.VITE_API_URL || '/api';
const SAVED_CUTS_KEY = 'vendor_saved_cuts';
const RECENT_PRODUCTS_KEY = 'vendor_recent_products';

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

function getRecentProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_PRODUCTS_KEY));
    if (Array.isArray(saved)) return saved.slice(0, 10);
  } catch {}
  return [];
}

function saveRecentProduct(product) {
  const recent = getRecentProducts();
  const filtered = recent.filter(
    (p) => p.name.toLowerCase() !== product.name.toLowerCase()
  );
  const updated = [product, ...filtered].slice(0, 10);
  localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(updated));
}

export default function AddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
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

  // Fish name suggestions
  const [showFishSuggestions, setShowFishSuggestions] = useState(false);
  const fishSuggestions = name.trim().length >= 1
    ? FISH_NAMES.filter(f =>
        f.en.toLowerCase().includes(name.toLowerCase()) ||
        f.ml.includes(name)
      ).slice(0, 6)
    : [];

  // Image states
  const [rawImage, setRawImage] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Image source picker
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Lightbox states
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Recent products
  const [recentProducts, setRecentProducts] = useState(() => getRecentProducts());

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const { post } = useApi();
  const { session } = useAuth();

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
    setShowImagePicker(false);
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
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
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

  const resetForm = () => {
    setName('');
    setDescription('');
    setShowDescription(false);
    setPrice('');
    setStockQty('');
    setCleaningEnabled(false);
    setCleaningCharge('');
    setCuttingOptions(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(SAVED_CUTS_KEY));
        if (Array.isArray(saved) && saved.length > 0) {
          return saved.map(c => ({ name: c.name || '', charge: c.charge || '' }));
        }
      } catch {}
      return [];
    });
    removeImage();
    setError('');
  };

  const handleChipSelect = (product) => {
    setName(product.name || '');
    setPrice(product.price ? String(product.price) : '');
    setStockQty(product.stock_qty ? String(product.stock_qty) : '');
    setDescription(product.description || '');
    setShowDescription(!!product.description);

    if (product.cleaning_charge) {
      setCleaningEnabled(true);
      setCleaningCharge(String(product.cleaning_charge));
    } else {
      setCleaningEnabled(false);
      setCleaningCharge('');
    }

    if (Array.isArray(product.cutting_options) && product.cutting_options.length > 0) {
      setCuttingOptions(product.cutting_options.map(c => ({
        name: c.name || c.type || '',
        charge: c.charge ? String(c.charge) : '',
      })));
    }
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

      // Save cutting options for reuse
      const cutsToSave = cuttingOptions
        .filter(c => c.name.trim())
        .map(c => ({ name: c.name.trim(), charge: c.charge }));
      if (cutsToSave.length > 0) {
        localStorage.setItem(SAVED_CUTS_KEY, JSON.stringify(cutsToSave));
      }

      // Save to recent products
      saveRecentProduct({
        name,
        price: parseFloat(price),
        stock_qty: parseFloat(stockQty) || 0,
        description: description || '',
        cleaning_charge: cleaningEnabled && cleaningCharge ? parseFloat(cleaningCharge) : null,
        cutting_options: cuttingArr.length > 0 ? cuttingArr.map(c => ({ name: c.type, charge: c.charge })) : [],
      });
      setRecentProducts(getRecentProducts());

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
      }, 1600);
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
        <div className="flex items-center gap-3 mb-4">
          <Link to="/products" className="p-2 -ml-2 rounded-xl hover:bg-surface-100 active:bg-surface-200 transition-colors">
            <ArrowLeft size={20} className="text-surface-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-surface-900">Add Product</h1>
            <p className="text-xs text-surface-500 mt-0.5">Add a new fish product to your store</p>
          </div>
        </div>

        {/* Quick Add Chips — Recent Products */}
        {recentProducts.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-surface-500 mb-2">Quick add from recent:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              {recentProducts.map((product, idx) => (
                <button
                  key={`${product.name}-${idx}`}
                  type="button"
                  onClick={() => handleChipSelect(product)}
                  className="flex-shrink-0 px-3.5 py-2 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium hover:bg-primary-100 active:bg-primary-200 transition-colors whitespace-nowrap"
                >
                  {product.name}
                  {product.price ? (
                    <span className="ml-1.5 text-xs text-primary-500">{'\u20B9'}{product.price}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Fish Name with suggestions */}
            <div className="relative">
              <label className="block text-[13px] font-semibold text-surface-600 mb-1.5">
                Fish Name
                <span className="ml-2 text-[11px] font-normal text-surface-400">മീനിന്റെ പേര്</span>
              </label>
              <input
                type="text"
                placeholder="e.g. King Fish, Pomfret"
                value={name}
                onChange={(e) => { setName(e.target.value); setShowFishSuggestions(true); }}
                onFocus={() => setShowFishSuggestions(true)}
                onBlur={() => setTimeout(() => setShowFishSuggestions(false), 200)}
                className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-base bg-surface-50/50 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
              />
              {showFishSuggestions && fishSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl shadow-elevated border border-surface-100 overflow-hidden max-h-48 overflow-y-auto">
                  {fishSuggestions.map((fish) => (
                    <button
                      key={fish.en}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setName(fish.en); setShowFishSuggestions(false); }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-primary-50 active:bg-primary-100 transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-surface-800">{fish.en}</span>
                      <span className="text-xs text-surface-400">{fish.ml}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-[13px] font-semibold text-surface-600 mb-1.5">
                Product Image
                <span className="ml-1.5 text-[11px] font-normal text-surface-400">ഫോട്ടോ</span>
              </label>
              {croppedPreview ? (
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-900 group ring-1 ring-surface-200/60 shadow-card">
                  <img
                    src={croppedPreview}
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
                        onClick={() => setShowCropper(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-semibold hover:bg-white/30 active:bg-white/40 transition-all ring-1 ring-white/10"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v4M18 18v4M2 6h4M18 2h4v4M2 18v4h4M22 18v4h-4M6 6h12v12H6z"/></svg>
                        Crop
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowImagePicker(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-semibold hover:bg-white/30 active:bg-white/40 transition-all ring-1 ring-white/10"
                      >
                        <Camera size={12} />
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
              ) : !showImagePicker ? (
                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center text-surface-400 bg-gradient-to-br from-surface-50 to-surface-100 border-2 border-dashed border-surface-200 hover:border-primary-300 hover:from-primary-50/50 hover:to-primary-50/30 hover:text-primary-600 active:from-primary-50 active:to-primary-50/50 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm ring-1 ring-surface-100 flex items-center justify-center mb-3 group-hover:ring-primary-200 group-hover:shadow-md group-hover:shadow-primary-500/10 transition-all duration-300">
                    <ImagePlus size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm font-semibold">Add Product Photo</span>
                  <span className="text-[11px] text-surface-400 mt-0.5 group-hover:text-primary-500 transition-colors">ഫോട്ടോ ചേർക്കുക</span>
                </button>
              ) : (
                <div className="w-full rounded-2xl bg-white border border-primary-200 shadow-card overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-4 py-3 border-b border-primary-100">
                    <p className="text-sm font-semibold text-surface-700">Choose photo source</p>
                    <p className="text-[11px] text-surface-400 mt-0.5">ഫോട്ടോ ചേർക്കുക</p>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2.5 py-6 px-3 rounded-xl bg-gradient-to-br from-surface-50 to-white border border-surface-200 text-surface-700 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/10 active:bg-primary-50 transition-all duration-300 group/btn"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary-50 ring-1 ring-primary-100 flex items-center justify-center group-hover/btn:bg-primary-100 group-hover/btn:ring-primary-200 transition-all">
                          <Camera size={22} className="text-primary-600" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-semibold block">Camera</span>
                          <span className="text-[10px] text-surface-400">ക്യാമറ</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2.5 py-6 px-3 rounded-xl bg-gradient-to-br from-surface-50 to-white border border-surface-200 text-surface-700 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/10 active:bg-primary-50 transition-all duration-300 group/btn"
                      >
                        <div className="w-12 h-12 rounded-xl bg-violet-50 ring-1 ring-violet-100 flex items-center justify-center group-hover/btn:bg-violet-100 group-hover/btn:ring-violet-200 transition-all">
                          <GalleryIcon size={22} className="text-violet-600" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-semibold block">Gallery</span>
                          <span className="text-[10px] text-surface-400">ഗാലറി</span>
                        </div>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(false)}
                      className="w-full mt-3 py-2 text-xs font-medium text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-surface-600 mb-1.5">
                  Price per kg
                  <span className="ml-1.5 text-[11px] font-normal text-surface-400">{'\u0D35\u0D3F\u0D32'}</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder={'\u20B9 450'}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-base bg-surface-50/50 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-surface-600 mb-1.5">
                  Stock (kg)
                  <span className="ml-1.5 text-[11px] font-normal text-surface-400">{'\u0D38\u0D4D\u0D31\u0D4D\u0D31\u0D4B\u0D15\u0D4D\u0D15\u0D4D'}</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="25"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-base bg-surface-50/50 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                />
              </div>
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
                <span className="text-sm font-semibold text-surface-900">Cleaning available · <span className="text-surface-400 font-normal text-xs">വൃത്തിയാക്കൽ</span></span>
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
                <span className="text-sm font-semibold text-surface-900">Cutting options · <span className="text-surface-400 font-normal text-xs">മുറിക്കൽ</span></span>
              </div>
              <p className="text-xs text-surface-500">"Whole Fish" is always available at base price. Tap below to add cut types:</p>
              {/* Quick cut type chips */}
              <div className="flex flex-wrap gap-1.5">
                {CUTTING_TYPES.map((ct) => {
                  const alreadyAdded = cuttingOptions.some(c => c.name.toLowerCase() === ct.en.toLowerCase());
                  return (
                    <button
                      key={ct.en}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => setCuttingOptions(prev => [...prev, { name: ct.en, charge: '' }])}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        alreadyAdded
                          ? 'bg-primary-50 text-primary-400 ring-1 ring-primary-100 cursor-default opacity-60'
                          : 'bg-surface-50 text-surface-600 ring-1 ring-surface-200 hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-200 active:bg-primary-100'
                      }`}
                    >
                      {ct.en} <span className="text-[10px] opacity-70">{ct.ml}</span>
                    </button>
                  );
                })}
              </div>
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
                      placeholder={'\u20B9/kg'}
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

            {/* Description (collapsed by default) */}
            {!showDescription ? (
              <button
                type="button"
                onClick={() => setShowDescription(true)}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <ChevronDown size={15} />
                Add description
              </button>
            ) : (
              <div>
                <label className="block text-[13px] font-semibold text-surface-600 mb-1.5">
                  Description
                  <span className="ml-1 text-[11px] font-normal text-surface-400">(optional)</span>
                </label>
                <textarea
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-base bg-surface-50/50 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex flex-col items-center justify-center font-semibold rounded-xl transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500
                disabled:opacity-50 disabled:cursor-not-allowed
                min-h-[56px] select-none active:scale-[0.98]
                bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20
                hover:shadow-lg hover:shadow-primary-600/30 hover:from-primary-700 hover:to-primary-600
                active:from-primary-700 active:to-primary-700
                px-6 py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {uploading ? 'Uploading image...' : 'Adding product...'}
                </span>
              ) : (
                <>
                  <span className="text-[15px]">Add Product</span>
                  <span className="text-[11px] font-normal opacity-80 mt-0.5">{'\u0D09\u0D7D\u0D2A\u0D4D\u0D2A\u0D28\u0D4D\u0D28\u0D02 \u0D1A\u0D47\u0D30\u0D4D\u200D\u0D15\u0D4D\u0D15\u0D41\u0D15'}</span>
                </>
              )}
            </button>
          </form>
        </Card>
      </div>

      {/* Success Toast / Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-3 animate-success-pop">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-success-check">
              <svg className="w-9 h-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-draw-check" />
              </svg>
            </div>
            <p className="text-lg font-bold text-surface-900">Product added! {'\u2713'}</p>
            <p className="text-sm text-surface-500">Your product is now live</p>
          </div>
        </div>
      )}

      {/* Inline styles for animations */}
      <style>{`
        @keyframes success-pop {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes success-check {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes draw-check {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-success-pop {
          animation: success-pop 0.4s ease-out forwards;
        }
        .animate-success-check {
          animation: success-check 0.4s ease-out 0.15s forwards;
          transform: scale(0);
        }
        .animate-draw-check path {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: draw-check 0.35s ease-out 0.35s forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

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
                className="flex-1 accent-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowCropper(false); if (!croppedBlob) removeImage(); }}
                className="flex-1 py-3 rounded-xl bg-surface-700 text-white text-sm font-semibold active:bg-surface-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropDone}
                className="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:bg-primary-700 transition-colors"
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
