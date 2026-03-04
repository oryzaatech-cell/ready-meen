import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Store, Phone, MapPin, Package, ChevronRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderTimeline from '../../components/OrderTimeline';
import formatCurrency from '../../shared/formatCurrency';
import { formatDate } from '../../shared/dateUtils';
import { getNextStatus, STATUS_LABELS, CUTTING_TYPES } from '../../shared/constants';

const cuttingMap = {};
for (const c of CUTTING_TYPES) cuttingMap[c.id] = c.label;

export default function OrderDetail() {
  const { id } = useParams();
  const { get, put } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    get(`/admin/orders/${id}`)
      .then(setData)
      .catch((err) => console.error('Failed to load order:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  if (!data?.order) {
    return (
      <PageLayout>
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <p className="text-center py-12 text-gray-500">Order not found</p>
      </PageLayout>
    );
  }

  const { order, items, user, vendor } = data;
  const nextStatus = getNextStatus(order.status);

  async function advanceStatus() {
    if (!nextStatus || advancing) return;
    setAdvancing(true);
    try {
      const { order: updated } = await put(`/admin/orders/${id}/status`, { status: nextStatus });
      setData(prev => ({ ...prev, order: updated }));
    } catch (err) {
      console.error('Failed to advance status:', err);
    } finally {
      setAdvancing(false);
    }
  }

  const commissionRate = Number(order.commission_rate) || 0;
  const commissionAmt = Number(order.commission_amt) || 0;
  const vendorNet = (Number(order.total_amt) || 0) - commissionAmt;

  return (
    <PageLayout>
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <Card className="p-4 mb-4">
        <OrderTimeline currentStatus={order.status} />
      </Card>

      {/* Customer Info */}
      {user && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} className="text-blue-500" /> Customer
          </h3>
          <p className="text-sm font-medium text-gray-900">{user.name || 'Unnamed'}</p>
          {user.mobile && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Phone size={12} /> {user.mobile}
            </p>
          )}
          {order.shipping_address && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={12} /> {typeof order.shipping_address === 'object'
                ? [order.shipping_address.flat_name, order.shipping_address.area].filter(Boolean).join(', ')
                : order.shipping_address}
            </p>
          )}
        </Card>
      )}

      {/* Vendor Info */}
      {vendor && (
        <Link to={`/vendors/${vendor.id}`}>
          <Card className="p-4 mb-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Store size={16} className="text-green-500" /> Vendor
                </h3>
                <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                {vendor.shop_name && <p className="text-xs text-gray-500">{vendor.shop_name}</p>}
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </Card>
        </Link>
      )}

      {/* Items Table */}
      <Card className="p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Package size={16} className="text-orange-500" /> Items ({items.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Cutting</th>
                <th className="pb-2 font-medium">Cleaning</th>
                <th className="pb-2 font-medium text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-gray-900">
                    {item.product?.name || `Product #${item.product_id}`}
                  </td>
                  <td className="py-2.5 text-gray-600">{item.qty}</td>
                  <td className="py-2.5">
                    <Badge color="blue">{cuttingMap[item.cutting_type] || item.cutting_type || 'Whole'}</Badge>
                  </td>
                  <td className="py-2.5">
                    {item.cleaning ? (
                      <Badge color="green">Yes</Badge>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-medium">{formatCurrency(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={4} className="py-2.5 text-right font-semibold text-gray-700">Total</td>
                <td className="py-2.5 text-right font-bold text-gray-900">{formatCurrency(order.total_amt)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Commission Breakdown */}
      <Card className="p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Commission Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Order Total</span>
            <span className="font-medium">{formatCurrency(order.total_amt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Commission Rate</span>
            <span className="font-medium text-pink-600">{commissionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Commission Amount</span>
            <span className="font-medium text-pink-600">{formatCurrency(commissionAmt)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold text-gray-700">Vendor Net</span>
            <span className="font-bold text-emerald-600">{formatCurrency(vendorNet)}</span>
          </div>
        </div>
      </Card>

      {/* Advance Status Button */}
      {nextStatus && order.status !== 'cancelled' && (
        <button
          onClick={advanceStatus}
          disabled={advancing}
          className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {advancing ? 'Updating...' : `Advance to ${STATUS_LABELS[nextStatus]}`}
        </button>
      )}
    </PageLayout>
  );
}
