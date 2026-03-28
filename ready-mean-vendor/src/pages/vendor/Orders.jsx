import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight, Clock, MapPin, Phone } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { useOrderBadge } from '../../context/OrderBadgeContext';
import { useRealtime } from '../../context/RealtimeContext';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { OrderListSkeleton } from '../../components/ui/Skeleton';
import formatCurrency from '../../shared/formatCurrency';

const statusFilters = ['all', 'placed', 'cancel_requested', 'processing', 'ready', 'delivered', 'cancelled'];

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const { markSeen } = useOrderBadge();
  const { orderVersion } = useRealtime();

  const loadOrders = useCallback(async () => {
    try {
      const { orders: data } = await get('/orders');
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); markSeen(); }, [orderVersion]);

  const { PullIndicator } = usePullToRefresh(loadOrders);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return <PageLayout><div className="animate-slide-up"><div className="h-5 w-32 bg-surface-200/60 rounded-lg animate-pulse mb-1" /><div className="h-3 w-24 bg-surface-200/60 rounded animate-pulse mb-4" /><div className="flex gap-1.5 mb-4">{[1,2,3,4].map(i=><div key={i} className="h-8 w-16 bg-surface-200/60 rounded-xl animate-pulse" />)}</div></div><OrderListSkeleton count={3} /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="animate-slide-up">
        <h1 className="text-lg font-bold text-surface-900 mb-0.5">Orders · <span className="text-surface-400 text-sm font-medium">ഓർഡറുകൾ</span></h1>
        <p className="text-xs text-surface-400 mb-4">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar -mx-4 px-4 animate-slide-up stagger-1">
        {statusFilters.map((s) => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
          const isActive = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap capitalize transition-all duration-300 active:scale-[0.96] ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-600/25'
                  : 'bg-white/80 text-surface-500 ring-1 ring-surface-100/80 hover:ring-surface-200 hover:text-surface-700'
              }`}
            >
              {s} <span className={isActive ? 'text-white/70' : 'text-surface-400'}>({count})</span>
            </button>
          );
        })}
      </div>

      <PullIndicator />

      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-surface-50 to-surface-100 rounded-3xl flex items-center justify-center mx-auto mb-5 ring-1 ring-surface-100 shadow-sm animate-wave-bob">
            <ClipboardList size={32} className="text-surface-300" />
          </div>
          <p className="font-bold text-surface-700">No orders found</p>
          <p className="text-xs text-surface-400 mt-1.5">Orders matching this filter will appear here</p>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          {filtered.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="p-4 group" hover>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-surface-900 truncate">{order.user?.name || `Order #${order.id}`}</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0 ml-3">
                    <OrderStatusBadge status={order.status} />
                    <ChevronRight size={16} className="text-surface-300 mt-0.5 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                {/* Item list */}
                {order.order_items?.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-surface-100/80 space-y-1">
                    {order.order_items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-surface-600">{item.product?.name || 'Item'}</span>
                        <span className="text-xs font-medium text-surface-500">{item.qty} kg</span>
                      </div>
                    ))}
                  </div>
                )}
                {order.shipping_address && (() => {
                  const lines = order.shipping_address.split('\n');
                  const mobileLine = lines[0]?.startsWith('Mobile:') ? lines[0] : null;
                  const addressLines = mobileLine ? lines.slice(1) : lines;
                  const addressText = addressLines.filter(Boolean).join(', ');
                  return (
                    <div className="mt-2.5 pt-2.5 border-t border-surface-100/80 space-y-1.5">
                      {addressText && (
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-primary-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-surface-600 line-clamp-2">{addressText}</p>
                        </div>
                      )}
                      {mobileLine && (
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-primary-400 flex-shrink-0" />
                          <p className="text-xs text-surface-600 font-medium">{mobileLine.replace('Mobile:', '').trim()}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-surface-100/80">
                  <span className="font-bold text-sm text-surface-900">{formatCurrency(order.total_amt)}</span>
                  <span className="flex items-center gap-1 text-xs text-surface-400">
                    <Clock size={11} />
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
