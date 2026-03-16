import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';
import formatCurrency from '../../shared/formatCurrency';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    get('/orders')
      .then(({ orders: data }) => setOrders(data || []))
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageLayout><div className="flex justify-center py-16"><Spinner /></div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-3">
        <h1 className="text-xl font-bold text-gray-900 mb-1">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={28} className="text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1">Your orders will appear here</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order #{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.order_items?.length || 0} item(s) &middot; {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-base font-bold text-primary-700">
                  {formatCurrency(order.total_amt)}
                </span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </PageLayout>
  );
}
