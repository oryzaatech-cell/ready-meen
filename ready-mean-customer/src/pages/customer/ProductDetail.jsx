import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Fish, Minus, Plus, ShoppingCart, Scissors, Sparkles } from 'lucide-react';
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

  // Compute effective price per kg
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

  // Available cutting options for this product (always includes 'whole')
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
    navigate('/cart');
  };

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="relative aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <ImageZoom src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Fish size={64} className="text-gray-300" />
          )}
          {soldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {product.vendor?.name} &middot; {soldOut ? <span className="text-red-500 font-semibold">Sold Out</span> : `${product.stock_qty} kg available`}
          </p>
          {product.description && (
            <p className="text-sm text-gray-600 mt-2">{product.description}</p>
          )}
          <p className="text-2xl font-bold text-primary-700 mt-3">
            {formatCurrency(product.price)}<span className="text-sm text-gray-500 font-normal">/kg</span>
          </p>
        </div>

        {/* Cutting Type Selection */}
        {availableCuttingTypes.length > 1 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Scissors size={15} className="text-orange-500" />
              Cutting Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableCuttingTypes.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => setCuttingType(ct.type)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    cuttingType === ct.type
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{ct.label}</span>
                  {ct.charge ? (
                    <span className="text-xs ml-1 text-gray-500">+{formatCurrency(ct.charge)}/kg</span>
                  ) : (
                    ct.type === 'whole' && <span className="text-xs ml-1 text-gray-400">Base price</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cleaning Toggle */}
        {product.cleaning_charge != null && (
          <div>
            <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <input
                type="checkbox"
                checked={cleaning}
                onChange={(e) => setCleaning(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
              />
              <Sparkles size={15} className="text-blue-500" />
              <div className="flex-1">
                <span className="text-sm font-medium">Add Cleaning</span>
                <span className="text-xs text-gray-500 ml-1">+{formatCurrency(product.cleaning_charge)}/kg</span>
              </div>
            </label>
          </div>
        )}

        {/* Effective Price Summary */}
        {(cuttingCharge > 0 || cleaningCharge > 0) && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Base price</span>
              <span>{formatCurrency(product.price)}/kg</span>
            </div>
            {cuttingCharge > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{cuttingType} charge</span>
                <span>+{formatCurrency(cuttingCharge)}/kg</span>
              </div>
            )}
            {cleaningCharge > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Cleaning charge</span>
                <span>+{formatCurrency(cleaningCharge)}/kg</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-primary-700 pt-1 border-t border-gray-200">
              <span>Effective price</span>
              <span>{formatCurrency(effectivePrice)}/kg</span>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity (kg)</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty(Math.max(0.5, qty - 0.5))}
              className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
            >
              <Minus size={16} />
            </button>
            <span className="text-xl font-semibold w-16 text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock_qty, qty + 0.5))}
              className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {soldOut ? (
          <div className="pt-4 border-t text-center">
            <p className="text-red-500 font-semibold">This product is currently sold out</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for fresh stock</p>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-primary-700">{formatCurrency(total)}</div>
            </div>
            <Button onClick={handleAddToCart} size="lg">
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
