import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import OrderTimeline from '../../components/OrderTimeline';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';
import formatCurrency from '../../shared/formatCurrency';
import { canCancel } from '../../shared/constants';
import { useAuth } from '../../hooks/useAuth';

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { get, put } = useApi();

  useEffect(() => { loadOrder(); }, [id]);

  async function loadOrder() {
    try {
      const { order: data } = await get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await put(`/orders/${id}/cancel`, {});
      loadOrder();
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  if (!order) {
    return <PageLayout><div className="text-center py-12 text-gray-500">Order not found</div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Order #{order.id}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        <Card className="p-4">
          <OrderTimeline currentStatus={order.status} />
        </Card>

        {/* Items */}
        <Card className="p-4">
          <h3 className="font-medium text-sm mb-2">Items</h3>
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1.5 border-b last:border-0">
              <div>
                <span>{item.product?.name || `Product #${item.product_id}`}</span>
                <span className="text-xs text-gray-500 ml-1">x{item.qty} kg</span>
                <div className="flex gap-1 mt-0.5">
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
              </div>
              <span className="font-medium">{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3 pt-3 border-t">
            <span>Total</span>
            <span className="text-primary-700">{formatCurrency(order.total_amt)}</span>
          </div>
        </Card>

        {/* Shipping & Contact */}
        {order.shipping_address && (() => {
          const lines = order.shipping_address.split('\n');
          const mobileLine = lines[0]?.startsWith('Mobile:') ? lines[0] : null;
          const addressLines = mobileLine ? lines.slice(1) : lines;
          return (
            <Card className="p-4">
              <h3 className="font-medium text-sm mb-2">Delivery Details</h3>
              {mobileLine && (
                <p className="text-sm font-medium text-gray-700 mb-1">{mobileLine}</p>
              )}
              <div className="text-sm text-gray-600">
                {addressLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </Card>
          );
        })()}

        {canCancel(order.status) && (
          <Button variant="danger" onClick={handleCancel} loading={cancelling} className="w-full">
            Cancel Order
          </Button>
        )}
      </div>
    </PageLayout>
  );
}
