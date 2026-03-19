import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Fish, Minus, Plus, ShoppingCart, Scissors, Sparkles, ChevronLeft } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useCart } from '../../context/CartContext';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ImageZoom from '../../components/ui/ImageZoom';
import formatCurrency from '../../shared/formatCurrency';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [cuttingType, setCuttingType] = useState('whole');
  const [cleaning, setCleaning] = useState(false);
  const [added, setAdded] = useState(false);
  const { get } = useApi();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    get(`/products/${id}`)
      .then(({ product: p }) => setProduct(p))
      .catch((err) => console.error('Failed to load product:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  if (!product) {
    return <PageLayout><div className="text-center py-12 text-gray-500">Product not found</div></PageLayout>;
  }

  const soldOut = !product.stock_qty || product.stock_qty <= 0;

  let effectivePrice = product.price;
  let cuttingCharge = 0;
  let cleaningCharge = 0;

  if (cuttingType !== 'whole' && Array.isArray(product.cutting_options)) {
    const opt = product.cutting_options.find(o => o.type === cuttingType);
    if (opt?.charge) {
      cuttingCharge = opt.charge;
      effectivePrice += cuttingCharge;
    }
  }

  if (cleaning && product.cleaning_charge) {
    cleaningCharge = product.cleaning_charge;
    effectivePrice += cleaningCharge;
  }

  const total = effectivePrice * qty;

  const availableCuttingTypes = [
    { type: 'whole', label: 'Whole Fish', charge: 0 },
    ...(Array.isArray(product.cutting_options)
      ? product.cutting_options.map(o => ({
          type: o.type,
          label: o.type,
          charge: o.charge,
        }))
      : []),
  ];

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      vendor_name: product.vendor?.name,
      price: effectivePrice,
      qty,
      image_url: product.image_url,
      cutting_type: cuttingType,
      cleaning,
    });
    setAdded(true);
    setTimeout(() => navigate('/cart'), 600);
  };

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-5 pb-28 md:pb-20">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors min-h-[44px]">
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm animate-fade-up">
          {product.image_url ? (
            <ImageZoom src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Fish size={64} className="text-gray-200" />
          )}
          {soldOut && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-gray-900 text-white text-sm font-bold px-5 py-2 rounded-full uppercase tracking-wide">
                Sold Out
              </span>
            </div>
          )}
          {!soldOut && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs text-emerald-600 font-bold px-3 py-1.5 rounded-full shadow-sm">
              {product.stock_qty} kg in stock
            </div>
          )}
        </div>

        {/* Info */}
        <div className="animate-fade-up delay-100">
          <h1 className="text-2xl font-display font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">{product.vendor?.name}</p>
          {product.description && (
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{product.description}</p>
          )}
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[1.7rem] font-bold text-gray-900 tracking-tight">{formatCurrency(product.price)}</span>
            <span className="text-sm text-gray-400 font-medium">/kg</span>
          </div>
        </div>

        {/* Cutting Type */}
        {availableCuttingTypes.length > 1 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
              <Scissors size={15} className="text-orange-500" />
              Cutting Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableCuttingTypes.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => setCuttingType(ct.type)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-sm transition-all duration-300 ${
                    cuttingType === ct.type
                      ? 'border-primary-600 bg-primary-600 text-white font-semibold shadow-md shadow-primary-600/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50/30 active:scale-[0.97]'
                  }`}
                >
                  <span>{ct.label}</span>
                  {ct.charge ? (
                    <span className="text-xs ml-1 opacity-70">+{formatCurrency(ct.charge)}/kg</span>
                  ) : (
                    ct.type === 'whole' && <span className="text-xs ml-1 opacity-50">Base</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cleaning */}
        {product.cleaning_charge != null && (
          <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-all duration-300 min-h-[56px] active:scale-[0.99] ${
            cleaning ? 'border-primary-500 bg-primary-50/60 shadow-sm shadow-primary-100' : 'border-gray-200 hover:border-primary-200'
          }`}>
            <input
              type="checkbox"
              checked={cleaning}
              onChange={(e) => setCleaning(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
            />
            <Sparkles size={16} className="text-blue-500" />
            <div className="flex-1">
              <span className="text-sm font-medium">Add Cleaning</span>
              <span className="text-xs text-gray-400 ml-1.5">+{formatCurrency(product.cleaning_charge)}/kg</span>
            </div>
          </label>
        )}

        {/* Price breakdown */}
        {(cuttingCharge > 0 || cleaningCharge > 0) && (
          <div className="bg-primary-50/50 rounded-xl p-4 text-sm space-y-1.5 border border-primary-100/50">
            <div className="flex justify-between text-gray-600">
              <span>Base price</span>
              <span>{formatCurrency(product.price)}/kg</span>
            </div>
            {cuttingCharge > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{cuttingType}</span>
                <span>+{formatCurrency(cuttingCharge)}/kg</span>
              </div>
            )}
            {cleaningCharge > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Cleaning</span>
                <span>+{formatCurrency(cleaningCharge)}/kg</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-primary-700 pt-1.5 border-t border-primary-200/50">
              <span>Effective price</span>
              <span>{formatCurrency(effectivePrice)}/kg</span>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2.5">Quantity (kg)</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty(Math.max(0.5, qty - 0.5))}
              className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-xl font-bold w-16 text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock_qty, qty + 0.5))}
              className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Add to cart / Sold out */}
        {soldOut ? (
          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-red-500 font-semibold">This product is currently sold out</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for fresh stock</p>
          </div>
        ) : (
          <div className="fixed bottom-20 md:bottom-4 left-0 right-0 mx-auto max-w-lg px-4 z-30"><div className="bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-100 p-4 shadow-lg shadow-gray-200/50 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total</div>
              <div className="text-2xl font-bold text-primary-700">{formatCurrency(total)}</div>
            </div>
            <Button onClick={handleAddToCart} size="lg" className={`min-h-[52px] rounded-xl shadow-md shadow-primary-600/15 transition-all duration-300 hover:-translate-y-0.5 ${added ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}>
              {added ? (
                <span>Added!</span>
              ) : (
                <>
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div></div>
        )}
      </div>
    </PageLayout>
  );
}
