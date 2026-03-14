import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, IndianRupee, TrendingUp, Copy, Share2, Check, Users, ChevronRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import formatCurrency from '../../shared/formatCurrency';

const statConfig = [
  { icon: ClipboardList, label: 'Active Orders', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200', bg: 'bg-blue-50' },
  { icon: Package, label: 'Products', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200', bg: 'bg-emerald-50' },
  { icon: IndianRupee, label: 'Net Earnings', color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-200', bg: 'bg-violet-50', hasSubtitle: true },
  { icon: TrendingUp, label: 'Total Orders', color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200', bg: 'bg-amber-50' },
];

export default function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { get } = useApi();
  const { user } = useAuth();

  const vendorCode = user?.vendor_code;
  const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || (window.location.port ? window.location.origin.replace(/:\d+/, ':3000') : 'http://localhost:3000');
  const inviteLink = vendorCode ? `${customerAppUrl}/join/${vendorCode}` : '';

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        get('/orders?limit=100'),
        get('/products/mine'),
      ]);
      setOrders(ordersRes.orders || []);
      setProducts(productsRes.products || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = textToCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCopyCode() {
    await copyToClipboard(vendorCode);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my store on Ready Meen',
          text: `Use my invite code ${vendorCode} to order fresh fish from my store!`,
          url: inviteLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await copyToClipboard(inviteLink);
    }
  }

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const revenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amt) || 0), 0);
  const totalCommission = deliveredOrders.reduce((sum, o) => sum + (Number(o.commission_amt) || 0), 0);
  const netEarnings = revenue - totalCommission;
  const commissionRate = Number(user?.commission_rate) || 0;
  const inStockProducts = products.filter(p => p.stock_qty > 0).length;

  const statValues = [
    activeOrders.length,
    `${inStockProducts}/${products.length}`,
    formatCurrency(netEarnings),
    orders.length,
  ];

  return (
    <PageLayout>
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">
          {user?.shop_name ? `${user.shop_name}` : `Hi, ${user?.name || 'Vendor'}`}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's how your store is doing</p>
      </div>

      {/* Invite Card */}
      {vendorCode && (
        <Card className="p-4 mb-5 bg-gradient-to-r from-emerald-50 to-primary-50 border-emerald-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-200">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Invite Customers</h3>
              <p className="text-xs text-gray-500">Share your code so customers can find your store</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xl px-3 py-2.5 font-mono text-lg font-bold text-center tracking-[0.2em] border border-emerald-200/60 text-gray-900">
              {vendorCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2.5 rounded-xl bg-white border border-emerald-200/60 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
              title="Copy invite link"
            >
              {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} className="text-gray-500" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm shadow-emerald-200 hover:from-emerald-700 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-700 transition-all"
              title="Share invite link"
            >
              <Share2 size={18} />
            </button>
          </div>
          {copied && <p className="text-xs text-emerald-600 font-medium text-center mt-2 animate-fade-in">Invite link copied!</p>}
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statConfig.map(({ icon: Icon, label, color, shadow, bg, hasSubtitle }, idx) => (
          <Card key={label} className="p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 bg-gradient-to-br ${color} ${shadow} shadow-sm`}>
              <Icon size={17} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statValues[idx]}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            {hasSubtitle && commissionRate > 0 && (
              <div className="text-[10px] text-gray-400 mt-0.5">after {commissionRate}% platform fee</div>
            )}
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900">Recent Orders</h2>
        <Link to="/orders" className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
          View all <ChevronRight size={16} />
        </Link>
      </div>
      {activeOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium text-sm">No active orders</p>
          <p className="text-xs text-gray-400 mt-1">New orders will appear here</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {activeOrders.slice(0, 5).map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="p-3.5 flex items-center justify-between hover:shadow-md transition-all group">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">{order.user?.name || `#${order.id}`}</p>
                  {order.shipping_address && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{order.shipping_address}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{order.order_items?.length || 0} items</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm font-bold text-gray-900 mt-1.5">{formatCurrency(order.total_amt)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
