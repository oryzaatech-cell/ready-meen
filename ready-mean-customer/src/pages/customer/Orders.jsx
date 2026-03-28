import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, Fish, Package, ChevronLeft } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useRealtime } from '../../context/RealtimeContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PageLayout from '../../components/layout/PageLayout';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { OrderListSkeleton } from '../../components/ui/Skeleton';
import formatCurrency from '../../shared/formatCurrency';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const { orderVersion } = useRealtime();
  const navigate = useNavigate();

  const loadOrders = useCallback(async () => {
    try {
      const { orders: data } = await get('/orders');
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [orderVersion]);

  const { PullIndicator } = usePullToRefresh(loadOrders);

  if (loading) {
    return <PageLayout><div className="max-w-lg mx-auto space-y-3"><div className="mb-1"><div className="h-6 w-24 bg-gray-200/60 rounded-lg animate-pulse" /><div className="h-3 w-32 bg-gray-200/60 rounded mt-1.5 animate-pulse" /></div><OrderListSkeleton count={3} /></div></PageLayout>;
  }

  return (
    <PageLayout>
      <PullIndicator />
      <div className="max-w-lg mx-auto space-y-3 pb-28 md:pb-20">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors min-h-[44px]">
          <ChevronLeft size={18} />
          Back
        </button>

        <div className="mb-1">
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {orders.length > 0 ? `${orders.length} order${orders.length > 1 ? 's' : ''} placed` : 'Track your orders here'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 animate-fade-up">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Package size={30} className="text-primary-300" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1.5">Your orders will show up here</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white rounded-2xl border border-gray-100/60 p-4 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {order.order_items?.length || 0} item(s) &middot; {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Ordered items */}
              {order.order_items?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {order.order_items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                        {item.product?.image_url ? (
                          <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Fish size={12} className="text-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{item.product?.name || 'Item'}</p>
                        <p className="text-[10px] text-gray-400">{item.qty} kg{item.cutting_type ? ` · ${item.cutting_type}` : ''}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-[15px] font-bold text-primary-700">
                  {formatCurrency(order.total_amt)}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-primary-500 transition-colors">
                  <span className="hidden group-hover:inline text-[11px] font-medium">Details</span>
                  <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </PageLayout>
  );
}
