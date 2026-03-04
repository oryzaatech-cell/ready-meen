import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, IndianRupee, ShoppingCart, TrendingUp } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import DateRangePicker from '../../components/ui/DateRangePicker';
import StatCard from '../../components/ui/StatCard';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';
import formatCurrency from '../../shared/formatCurrency';
import { getDateRange, formatDate } from '../../shared/dateUtils';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState(getDateRange('30d'));
  const [searchTerm, setSearchTerm] = useState('');
  const { get } = useApi();

  const fetchOrders = useCallback((range, status, search) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (range?.from) params.set('from', range.from);
    if (range?.to) params.set('to', range.to);
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    params.set('limit', '200');

    get(`/admin/orders?${params.toString()}`)
      .then(({ orders: data }) => setOrders(data || []))
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, [get]);

  useEffect(() => {
    fetchOrders(dateRange, filter, '');
  }, []);

  function handleDateChange(range) {
    setDateRange(range);
    fetchOrders(range, filter, searchTerm);
  }

  function handleStatusChange(status) {
    setFilter(status);
    fetchOrders(dateRange, status, searchTerm);
  }

  function handleSearch() {
    fetchOrders(dateRange, filter, searchTerm);
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amt) || 0), 0);
    return {
      total: orders.length,
      revenue: totalRevenue,
      avg: orders.length > 0 ? totalRevenue / orders.length : 0,
    };
  }, [orders]);

  return (
    <PageLayout>
      <h1 className="text-xl font-bold mb-4">All Orders</h1>

      {/* Date Range Picker */}
      <div className="mb-4">
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Search
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {['', 'placed', 'processing', 'ready', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatCard icon={ShoppingCart} label="Total Orders" value={stats.total} gradient="orange" />
          <StatCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(stats.revenue)} gradient="purple" />
          <StatCard icon={TrendingUp} label="Avg Order Value" value={formatCurrency(stats.avg)} gradient="blue" />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <DashboardSkeleton />
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ClipboardList size={32} className="mx-auto mb-2 text-gray-300" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className={`border-b last:border-0 hover:bg-gray-50 cursor-pointer ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium">#{o.id}</td>
                  <td className="px-4 py-3">{o.user?.name || `#${o.user_id}`}</td>
                  <td className="px-4 py-3">{o.order_items?.length || 0}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(o.total_amt)}</td>
                  <td className="px-4 py-3 text-pink-600">
                    {Number(o.commission_amt) > 0 ? `${formatCurrency(o.commission_amt)} (${o.commission_rate}%)` : '-'}
                  </td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
