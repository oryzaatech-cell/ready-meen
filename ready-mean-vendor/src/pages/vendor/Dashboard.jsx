import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, IndianRupee, TrendingUp, Copy, Share2, Check, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import formatCurrency from '../../shared/formatCurrency';

export default function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { get } = useApi();
  const { user } = useAuth();

  const vendorCode = user?.vendor_code;
  const inviteLink = vendorCode ? `${window.location.origin.replace(/:\d+/, ':3000')}/join/${vendorCode}` : '';

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        get('/orders?limit=5'),
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

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = inviteLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
      handleCopyCode();
    }
  }

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const revenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.total_amt) || 0), 0);
  const inStockProducts = products.filter(p => p.stock_qty > 0).length;

  return (
    <PageLayout>
      <h1 className="text-xl font-bold mb-4">Vendor Dashboard</h1>

      {vendorCode && (
        <Card className="p-4 mb-6 bg-primary-50 border-primary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-100">
              <Users size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Invite Customers</h3>
              <p className="text-xs text-primary-600">Share your code so customers can find your store</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-white rounded-lg px-3 py-2 font-mono text-lg font-bold text-center tracking-widest border border-primary-200">
              {vendorCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2.5 rounded-lg bg-white border border-primary-200 hover:bg-primary-100 transition-colors"
              title="Copy invite link"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-primary-600" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              title="Share invite link"
            >
              <Share2 size={18} />
            </button>
          </div>
          {copied && <p className="text-xs text-green-600 text-center mt-2">Invite link copied!</p>}
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: ClipboardList, label: 'Active Orders', value: activeOrders.length, color: 'text-blue-600 bg-blue-50' },
          { icon: Package, label: 'Products', value: `${inStockProducts}/${products.length}`, color: 'text-green-600 bg-green-50' },
          { icon: IndianRupee, label: 'Revenue', value: formatCurrency(revenue), color: 'text-primary-600 bg-primary-50' },
          { icon: TrendingUp, label: 'Total Orders', value: orders.length, color: 'text-orange-600 bg-orange-50' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon size={20} />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Recent Orders</h2>
        <Link to="/orders" className="text-sm text-primary-600 hover:underline">View all</Link>
      </div>
      {activeOrders.length === 0 ? (
        <Card className="p-6 text-center text-gray-500 text-sm">No active orders</Card>
      ) : (
        <div className="space-y-2">
          {activeOrders.slice(0, 5).map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="p-3 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-medium">#{order.id}</p>
                  <p className="text-xs text-gray-500">{order.order_items?.length || 0} items</p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm font-semibold mt-1">{formatCurrency(order.total_amt)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
