import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import OrderTimeline from '../../components/OrderTimeline';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';
import formatCurrency from '../../shared/formatCurrency';
import { canCancel, isCancelPending } from '../../shared/constants';
import { useAuth } from '../../hooks/useAuth';

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
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
      const result = await put(`/orders/${id}/cancel`, {});
      setShowCancelModal(false);
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
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] mb-2">
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
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
          {order.payment_method && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
              <span className="text-[11px] text-gray-400">Payment:</span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
              </span>
            </div>
          )}
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

        {order.cancel_rejected_at && order.status === 'placed' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-red-700">Cancel request was rejected</p>
            <p className="text-xs text-red-500 mt-1">Your order is already being processed by the vendor</p>
          </div>
        )}

        {isCancelPending(order.status) && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-orange-700">Cancellation requested</p>
            <p className="text-xs text-orange-500 mt-1">Waiting for vendor approval</p>
          </div>
        )}

        {canCancel(order.status) && (
          <Button variant="danger" onClick={() => setShowCancelModal(true)} className="w-full rounded-xl min-h-[48px]">
            Cancel Order
          </Button>
        )}
      </div>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Order">
        <div className="space-y-4 pb-2">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this order?
          </p>
          {order.created_at && (Date.now() - new Date(order.created_at).getTime() > 120000) && (
            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
              This order was placed more than 2 minutes ago. Your cancellation will need vendor approval.
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)} className="flex-1 rounded-xl min-h-[44px]">
              Wait, Keep It
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling} className="flex-1 rounded-xl min-h-[44px]">
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
