import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
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
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-bold">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ClipboardList size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No orders yet</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="p-4" onClick={() => navigate(`/orders/${order.id}`)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">Order #{order.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.order_items?.length || 0} item(s)
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-sm font-semibold text-primary-700">
                  {formatCurrency(order.total_amt)}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
}
