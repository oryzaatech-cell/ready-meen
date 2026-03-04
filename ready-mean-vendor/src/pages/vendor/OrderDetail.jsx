import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import OrderTimeline from '../../components/OrderTimeline';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';
import formatCurrency from '../../shared/formatCurrency';
import { getNextStatus, STATUS_LABELS } from '../../shared/constants';

export default function VendorOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  async function handleAdvanceStatus() {
    const next = getNextStatus(order.status);
    if (!next) return;

    setUpdating(true);
    try {
      await put(`/orders/${id}/status`, { status: next });
      loadOrder();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  if (!order) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ShoppingBag size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600">Order not found</p>
          <Link to="/orders" className="text-sm text-emerald-600 font-semibold mt-2 inline-block">Back to orders</Link>
        </div>
      </PageLayout>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <Link to="/orders" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <Card className="p-4">
          <OrderTimeline currentStatus={order.status} />
        </Card>

        {/* Customer info */}
        <Card className="p-4">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Customer</h3>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-gray-500">
                {(order.user?.name || 'U')[0].toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-sm text-gray-900">{order.user?.name || `User #${order.user_id}`}</p>
          </div>
          {order.shipping_address && (() => {
            const lines = order.shipping_address.split('\n');
            const mobileLine = lines[0]?.startsWith('Mobile:') ? lines[0] : null;
            const addressLines = mobileLine ? lines.slice(1) : lines;
            return (
              <div className="space-y-2 ml-12">
                {mobileLine && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{mobileLine.replace('Mobile:', '').trim()}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  <div>
                    {addressLines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Items */}
        <Card className="p-4">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Items ({order.order_items?.length || 0})</h3>
          <div className="space-y-0">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-3 border-b border-gray-100 last:border-0">
                <div>
                  <span className="font-medium text-gray-900">{item.product?.name || `Product #${item.product_id}`}</span>
                  <span className="text-gray-500 ml-1.5">x{item.qty} kg</span>
                  <div className="flex gap-1.5 mt-1.5">
                    {item.cutting_type && item.cutting_type !== 'whole' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200/60">
                        {item.cutting_type}
                      </span>
                    )}
                    {item.cleaning && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200/60">
                        Cleaned
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-gray-900 flex-shrink-0">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center font-bold mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-lg text-emerald-600">{formatCurrency(order.total_amt)}</span>
          </div>
        </Card>

        {/* Action */}
        {nextStatus && (
          <Button onClick={handleAdvanceStatus} loading={updating} className="w-full" size="lg">
            Mark as {STATUS_LABELS[nextStatus]}
          </Button>
        )}
      </div>
    </PageLayout>
  );
}
