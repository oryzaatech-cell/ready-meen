import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, ShoppingBag, Scissors, Sparkles } from 'lucide-react';
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
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-surface-100">
            <ShoppingBag size={28} className="text-surface-300" />
          </div>
          <p className="font-semibold text-surface-600">Order not found</p>
          <Link to="/orders" className="text-sm text-primary-600 font-semibold mt-3 inline-block hover:text-primary-700 transition-colors">
            Back to orders
          </Link>
        </div>
      </PageLayout>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <Link to="/orders" className="p-2 -ml-2 rounded-xl hover:bg-surface-100 active:bg-surface-200 transition-colors">
            <ArrowLeft size={20} className="text-surface-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-surface-900">Order #{order.id}</h1>
            <p className="text-xs text-surface-400">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <Card className="p-5">
          <OrderTimeline currentStatus={order.status} />
        </Card>

        {/* Customer info */}
        <Card className="p-5">
          <h3 className="font-bold text-sm text-surface-900 mb-3.5">Customer</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary-500/15">
              <span className="text-sm font-bold text-white">
                {(order.user?.name || 'U')[0].toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-sm text-surface-900">{order.user?.name || `User #${order.user_id}`}</p>
          </div>
          {order.shipping_address && (() => {
            const lines = order.shipping_address.split('\n');
            const mobileLine = lines[0]?.startsWith('Mobile:') ? lines[0] : null;
            const addressLines = mobileLine ? lines.slice(1) : lines;
            return (
              <div className="space-y-2.5 ml-[52px]">
                {mobileLine && (
                  <div className="flex items-center gap-2.5 text-sm text-surface-700">
                    <div className="w-6 h-6 bg-surface-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={12} className="text-surface-400" />
                    </div>
                    <span>{mobileLine.replace('Mobile:', '').trim()}</span>
                  </div>
                )}
                <div className="flex items-start gap-2.5 text-sm text-surface-600">
                  <div className="w-6 h-6 bg-surface-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={12} className="text-surface-400" />
                  </div>
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
        <Card className="p-5">
          <h3 className="font-bold text-sm text-surface-900 mb-3.5">Items ({order.order_items?.length || 0})</h3>
          <div className="space-y-0">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-3.5 border-b border-surface-100/80 last:border-0">
                <div>
                  <span className="font-semibold text-surface-900">{item.product?.name || `Product #${item.product_id}`}</span>
                  <span className="text-surface-400 ml-1.5">x{item.qty} kg</span>
                  {(item.cutting_type && item.cutting_type !== 'whole') || item.cleaning ? (
                    <div className="flex gap-1.5 mt-2">
                      {item.cutting_type && item.cutting_type !== 'whole' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200/60">
                          <Scissors size={10} /> {item.cutting_type}
                        </span>
                      )}
                      {item.cleaning && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200/60">
                          <Sparkles size={10} /> Cleaned
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
                <span className="font-bold text-surface-900 flex-shrink-0">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center font-bold mt-4 pt-4 border-t-2 border-surface-200">
            <span className="text-surface-900">Total</span>
            <span className="text-lg text-gradient">{formatCurrency(order.total_amt)}</span>
          </div>
          {order.payment_method && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-surface-400">Payment:</span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg ring-1 ring-amber-200/60">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
              </span>
            </div>
          )}
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
