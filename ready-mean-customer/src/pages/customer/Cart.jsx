import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import formatCurrency from '../../shared/formatCurrency';

export default function Cart() {
  const { items, updateQty, removeItem, totalAmount, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mt-1">Browse fresh fish and add items to your cart</p>
          <Link to="/home">
            <Button className="mt-4">Browse Fish</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Cart ({itemCount})</h1>
          <button onClick={clearCart} className="text-sm text-red-600 hover:underline">Clear all</button>
        </div>

        {items.map((item) => (
          <Card key={item.cart_key} className="p-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag size={20} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{item.name}</h3>
                <p className="text-xs text-gray-500">{item.vendor_name}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {item.cutting_type && item.cutting_type !== 'whole' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      {item.cutting_type}
                    </span>
                  )}
                  {item.cleaning && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      Cleaned
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-primary-700 mt-1">{formatCurrency(item.price)}/kg</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => removeItem(item.cart_key)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.cart_key, item.qty - 0.5)}
                    className="w-7 h-7 rounded border flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.cart_key, item.qty + 0.5)}
                    className="w-7 h-7 rounded border flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Total</span>
            <span className="text-xl font-bold text-primary-700">{formatCurrency(totalAmount)}</span>
          </div>
          <Button onClick={() => navigate('/checkout')} className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </Card>
      </div>
    </PageLayout>
  );
}
