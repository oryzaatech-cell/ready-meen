import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';
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
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Your cart is empty</h2>
          <p className="text-sm text-gray-400 mt-1.5">Browse fresh fish and add items to your cart</p>
          <Link to="/home">
            <Button className="mt-6 rounded-xl min-h-[48px]">Browse Fish</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">Cart <span className="text-gray-400 font-normal text-base">({itemCount})</span></h1>
          <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-600 font-medium min-h-[44px] px-2 transition-colors">Clear all</button>
        </div>

        {items.map((item) => (
          <div key={item.cart_key} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag size={20} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm text-gray-900 truncate pr-2">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.cart_key)}
                    className="p-1.5 -mr-1.5 text-gray-300 hover:text-red-500 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">{item.vendor_name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.cutting_type && item.cutting_type !== 'whole' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-100">
                      {item.cutting_type}
                    </span>
                  )}
                  {item.cleaning && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                      Cleaned
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-sm font-bold text-primary-700">{formatCurrency(item.price * item.qty)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.cart_key, item.qty - 0.5)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-8 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.cart_key, item.qty + 0.5)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Total & Checkout */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mt-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Total Amount</span>
            <span className="text-xl font-bold text-primary-700">{formatCurrency(totalAmount)}</span>
          </div>
          <Button onClick={() => navigate('/checkout')} className="w-full min-h-[52px] rounded-xl shadow-md shadow-primary-600/15" size="lg">
            Proceed to Checkout <ArrowRight size={16} className="ml-1.5" />
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
