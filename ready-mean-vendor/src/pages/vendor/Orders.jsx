import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
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
      <h1 className="text-xl font-bold mb-4">Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {s} {s !== 'all' ? `(${orders.filter(o => o.status === s).length})` : `(${orders.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ClipboardList size={32} className="mx-auto mb-2 text-gray-300" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">#{order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.order_items?.length || 0} item(s)
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="font-semibold text-sm text-primary-700">{formatCurrency(order.total_amt)}</span>
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
