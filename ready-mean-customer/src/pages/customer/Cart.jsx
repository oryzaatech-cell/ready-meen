import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight, Fish, ChevronLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import formatCurrency from '../../shared/formatCurrency';

export default function Cart() {
  const { items, updateQty, removeItem, totalAmount, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <PageLayout>
        <div className="text-center py-20 animate-fade-up">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <ShoppingBag size={30} className="text-primary-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Your cart is empty</h2>
          <p className="text-sm text-gray-400 mt-1.5 max-w-[240px] mx-auto">Browse today's fresh catch and add to your cart</p>
          <Link to="/home">
            <Button className="mt-6 rounded-xl min-h-[48px] px-6 shadow-md shadow-primary-600/15">
              <Fish size={16} className="mr-2" /> Browse Fish
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-3 pb-28 md:pb-20">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors min-h-[44px]">
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-xs text-gray-400 mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 font-semibold min-h-[44px] px-3 transition-colors rounded-lg hover:bg-red-50">
            Clear
          </button>
        </div>

        {items.map((item) => (
          <div key={item.cart_key} className="bg-white rounded-2xl border border-gray-100/60 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex gap-3.5">
              <div className="w-[68px] h-[68px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Fish size={22} className="text-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 truncate pr-2">{item.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.vendor_name}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.cart_key)}
                    className="p-1.5 -mr-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {item.cutting_type && item.cutting_type !== 'whole' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                      {item.cutting_type}
                    </span>
                  )}
                  {item.cleaning && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                      Cleaned
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-[15px] font-bold ${item.stock_qty <= 0 ? 'text-red-500' : 'text-primary-700'}`}>
                    {item.stock_qty <= 0 ? 'Sold Out' : formatCurrency(item.price * item.qty)}
                  </span>
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100">
                    <button
                      onClick={() => updateQty(item.cart_key, item.qty - 0.5)}
                      disabled={item.stock_qty <= 0}
                      className={`w-8 h-8 rounded-l-lg flex items-center justify-center transition-colors ${item.stock_qty <= 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className={`text-sm font-bold w-9 text-center ${item.stock_qty <= 0 ? 'text-red-500' : 'text-gray-800'}`}>
                      {item.stock_qty <= 0 ? 0 : item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.cart_key, Math.min(item.stock_qty || Infinity, item.qty + 0.5))}
                      disabled={item.stock_qty <= 0 || item.qty >= item.stock_qty}
                      className={`w-8 h-8 rounded-r-lg flex items-center justify-center transition-colors ${item.stock_qty <= 0 || item.qty >= item.stock_qty ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Checkout - sticky */}
        <div className="sticky md:bottom-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-xl shadow-gray-200/60" style={{ bottom: 'calc(var(--bottom-nav-h, 66px) + env(safe-area-inset-bottom, 0px) + 8px)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total</span>
              <div className="text-2xl font-bold text-gray-900 -mt-0.5">{formatCurrency(totalAmount)}</div>
            </div>
            <span className="text-xs text-gray-400">{itemCount} items</span>
          </div>
          <Button onClick={() => navigate('/checkout')} className="w-full min-h-[52px] rounded-xl shadow-md shadow-primary-600/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" size="lg">
            Checkout <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
