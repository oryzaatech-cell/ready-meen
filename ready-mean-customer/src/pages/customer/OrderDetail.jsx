import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
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
  const navigate = useNavigate();
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
    return <PageLayout><div className="flex justify-center py-16"><Spinner /></div></PageLayout>;
  }

  if (!order) {
    return <PageLayout><div className="text-center py-16 text-gray-500">Order not found</div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/orders')} className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <OrderTimeline currentStatus={order.status} />
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Items</h3>
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="font-medium text-gray-800">{item.product?.name || `Product #${item.product_id}`}</span>
                <span className="text-xs text-gray-400 ml-1.5">x{item.qty}kg</span>
                <div className="flex gap-1 mt-1">
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
              </div>
              <span className="font-semibold text-gray-700">{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-100">
            <span>Total</span>
            <span className="text-primary-700">{formatCurrency(order.total_amt)}</span>
          </div>
        </div>

        {/* Delivery details */}
        {order.shipping_address && (() => {
          const lines = order.shipping_address.split('\n');
          const mobileLine = lines[0]?.startsWith('Mobile:') ? lines[0] : null;
          const addressLines = mobileLine ? lines.slice(1) : lines;
          return (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Delivery Details</h3>
              {mobileLine && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Phone size={14} className="text-gray-400" />
                  <span className="font-medium">{mobileLine.replace('Mobile: ', '')}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  {addressLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {canCancel(order.status) && (
          <Button variant="danger" onClick={handleCancel} loading={cancelling} className="w-full rounded-xl min-h-[48px]">
            Cancel Order
          </Button>
        )}
      </div>
    </PageLayout>
  );
}
