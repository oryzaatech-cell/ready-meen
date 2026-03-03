import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, ShoppingCart, TrendingUp, UserPlus } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import DateRangePicker from '../../components/ui/DateRangePicker';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';
import formatCurrency from '../../shared/formatCurrency';
import { getDateRange, formatShortDate, formatDate } from '../../shared/dateUtils';
import { STATUS_LABELS, FISH_CATEGORIES } from '../../shared/constants';

const PIE_COLORS = {
  placed: '#EAB308',
  accepted: '#3B82F6',
  processing: '#F97316',
  ready: '#22C55E',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const CATEGORY_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F97316', '#EF4444', '#EC4899'];

const CATEGORY_MAP = {};
for (const c of FISH_CATEGORIES) CATEGORY_MAP[c.id] = c.label;

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(getDateRange('30d'));
  const [revenueView, setRevenueView] = useState('daily');
  const { get } = useApi();

  const fetchData = useCallback((range) => {
    setLoading(true);
    const params = range ? `?from=${range.from}&to=${range.to}` : '';
    get(`/admin/analytics/detailed${params}`)
      .then(setData)
      .catch((err) => console.error('Analytics error:', err))
      .finally(() => setLoading(false));
  }, [get]);

  useEffect(() => {
    fetchData(dateRange);
  }, []);

  function handleDateChange(range) {
    setDateRange(range);
    fetchData(range);
  }

  if (loading) {
    return (
      <PageLayout>
        <h1 className="text-xl font-bold mb-4">Analytics</h1>
        <DashboardSkeleton />
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout>
        <div className="text-center py-12 text-gray-500">
          <TrendingUp size={32} className="mx-auto mb-2 text-gray-300" />
          <p>Unable to load analytics</p>
        </div>
      </PageLayout>
    );
  }

  const { summary, daily_revenue, monthly_revenue, top_products, top_vendors, revenue_by_category, customer_growth } = data;

  const statusPieData = Object.entries(summary.orders_by_status || {}).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    color: PIE_COLORS[status] || '#9CA3AF',
  }));

  const categoryPieData = (revenue_by_category || []).map((c, i) => ({
    name: CATEGORY_MAP[c.category] || c.category,
    value: c.revenue,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const revenueChartData = revenueView === 'daily' ? daily_revenue : monthly_revenue;
  const revenueXKey = revenueView === 'daily' ? 'date' : 'month';

  return (
    <PageLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">Analytics</h1>
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={IndianRupee} label="Revenue" value={formatCurrency(summary.total_revenue)} gradient="purple" />
        <StatCard icon={ShoppingCart} label="Orders" value={summary.total_orders} gradient="orange" />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={formatCurrency(summary.avg_order_value)} gradient="blue" />
        <StatCard icon={UserPlus} label="New Customers" value={summary.new_customers} gradient="green" />
      </div>

      {/* Revenue Chart (full width) */}
      <ChartCard
        title="Revenue"
        subtitle={revenueView === 'daily' ? 'Daily breakdown' : 'Monthly breakdown'}
        className="mb-6"
        action={
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setRevenueView('daily')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${revenueView === 'daily' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setRevenueView('monthly')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${revenueView === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Monthly
            </button>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey={revenueXKey} tickFormatter={revenueView === 'daily' ? formatShortDate : (v) => v} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              labelFormatter={revenueView === 'daily' ? formatDate : (v) => v}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Orders Trend + Customer Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Orders Trend" subtitle="Daily order count">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, 'Orders']}
                labelFormatter={formatDate}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="order_count" stroke="#F97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Growth" subtitle="New signups per day">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={customer_growth}>
              <defs>
                <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, 'New Users']}
                labelFormatter={formatDate}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="new_users" stroke="#10B981" fill="url(#custGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Category Pie + Status Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Revenue by Category">
          {categoryPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">No category data</p>
          )}
        </ChartCard>

        <ChartCard title="Orders by Status">
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">No order data</p>
          )}
        </ChartCard>
      </div>

      {/* Top Products & Top Vendors Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Top Products" subtitle="By quantity sold">
          {top_products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Qty</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {top_products.map((p, i) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 font-medium text-gray-400">{i + 1}</td>
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700">
                          {CATEGORY_MAP[p.category] || p.category}
                        </span>
                      </td>
                      <td className="py-2 text-right">{p.qty_sold}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No product data</p>
          )}
        </ChartCard>

        <ChartCard title="Top Vendors" subtitle="By revenue">
          {top_vendors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                    <th className="pb-2 font-medium text-right">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {top_vendors.map((v, i) => (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="py-2 font-medium text-gray-400">{i + 1}</td>
                      <td className="py-2 font-medium">{v.name}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(v.revenue)}</td>
                      <td className="py-2 text-right">{v.order_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No vendor data</p>
          )}
        </ChartCard>
      </div>
    </PageLayout>
  );
}
