import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';
import formatCurrency from '../../shared/formatCurrency';

const statusFilters = ['all', 'placed', 'accepted', 'processing', 'ready', 'delivered', 'cancelled'];

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    get('/orders')
      .then(({ orders: data }) => setOrders(data || []))
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  return (
    <PageLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Orders</h1>
      <p className="text-sm text-gray-500 mb-4">{orders.length} total orders</p>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar -mx-4 px-4">
        {statusFilters.map((s) => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
          const isActive = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-white text-gray-600 border border-gray-200 active:bg-gray-100'
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600">No orders found</p>
          <p className="text-xs text-gray-400 mt-1">Orders matching this filter will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="p-4 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">{order.user?.name || `Order #${order.id}`}</p>
                    {order.shipping_address && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.shipping_address}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.order_items?.length || 0} item(s)
                    </p>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0 ml-3">
                    <OrderStatusBadge status={order.status} />
                    <ChevronRight size={16} className="text-gray-300 mt-0.5 group-hover:text-gray-400 transition-colors" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="font-bold text-sm text-gray-900">{formatCurrency(order.total_amt)}</span>
                  <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
