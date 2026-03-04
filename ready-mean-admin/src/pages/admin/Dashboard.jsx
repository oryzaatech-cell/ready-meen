import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Store, ClipboardList, IndianRupee, TrendingUp, ArrowRight, Percent } from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';
import formatCurrency from '../../shared/formatCurrency';
import { formatDate, formatShortDate } from '../../shared/dateUtils';
import { STATUS_LABELS, FISH_CATEGORIES } from '../../shared/constants';

const PIE_COLORS = {
  placed: '#EAB308',
  processing: '#F97316',
  ready: '#22C55E',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const CATEGORY_MAP = {};
for (const c of FISH_CATEGORIES) CATEGORY_MAP[c.id] = c.label;

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    get('/admin/analytics/detailed')
      .then(setData)
      .catch((err) => console.error('Analytics error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageLayout><DashboardSkeleton /></PageLayout>;
  }

  if (!data) {
    return (
      <PageLayout>
        <div className="text-center py-12 text-gray-500">
          <TrendingUp size={32} className="mx-auto mb-2 text-gray-300" />
          <p>Unable to load dashboard</p>
        </div>
      </PageLayout>
    );
  }

  const { summary, daily_revenue, top_products, top_vendors, recent_orders } = data;

  const stats = [
    { icon: Users, label: 'Total Users', value: summary.total_users, gradient: 'blue', link: '/users' },
    { icon: Store, label: 'Vendors', value: summary.total_vendors, gradient: 'green', link: '/vendors' },
    { icon: ClipboardList, label: 'Total Orders', value: summary.total_orders, gradient: 'orange', link: '/orders' },
    { icon: IndianRupee, label: 'Revenue', value: formatCurrency(summary.total_revenue), gradient: 'purple', link: '/analytics' },
    { icon: Percent, label: 'Platform Earnings', value: formatCurrency(summary.total_commission || 0), gradient: 'pink', link: '/analytics' },
  ];

  const statusPieData = Object.entries(summary.orders_by_status || {}).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    color: PIE_COLORS[status] || '#9CA3AF',
  }));

  return (
    <PageLayout>
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stats.map(({ icon, label, value, gradient, link }) => (
          <Link key={label} to={link}>
            <StatCard icon={icon} label={label} value={value} gradient={gradient} onClick={() => {}} />
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={daily_revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                labelFormatter={formatDate}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Orders by Status */}
        <ChartCard title="Orders by Status" subtitle="Current period">
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">No orders yet</p>
          )}
        </ChartCard>
      </div>

      {/* Recent Orders */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link to="/orders" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {recent_orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((o) => (
                  <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer">
                    <td className="py-2.5 font-medium">#{o.id}</td>
                    <td className="py-2.5">{o.user_name}</td>
                    <td className="py-2.5 font-medium">{formatCurrency(o.total_amt)}</td>
                    <td className="py-2.5"><OrderStatusBadge status={o.status} /></td>
                    <td className="py-2.5 text-gray-500">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">No recent orders</p>
        )}
      </Card>

      {/* Top Products & Top Vendors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Top Products</h3>
          {top_products.length > 0 ? (
            <div className="space-y-3">
              {top_products.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="text-xs text-gray-500">{CATEGORY_MAP[p.category] || p.category} &middot; {p.qty_sold} sold</div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No product data</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Top Vendors</h3>
          {top_vendors.length > 0 ? (
            <div className="space-y-3">
              {top_vendors.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{v.name}</div>
                    <div className="text-xs text-gray-500">{v.order_count} orders</div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(v.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No vendor data</p>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
