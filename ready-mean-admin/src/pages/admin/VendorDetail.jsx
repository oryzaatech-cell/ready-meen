import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store, Phone, MapPin, Hash, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import formatCurrency from '../../shared/formatCurrency';
import { FISH_CATEGORIES } from '../../shared/constants';

const TABS = ['Products', 'Orders', 'Customers'];

const categoryMap = {};
for (const c of FISH_CATEGORIES) categoryMap[c.id] = c.label;

export default function VendorDetail() {
  const { id } = useParams();
  const { get } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Products');

  useEffect(() => {
    get(`/admin/vendors/${id}`)
      .then(setData)
      .catch((err) => console.error('Failed to load vendor:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  if (!data?.vendor) {
    return (
      <PageLayout>
        <Link to="/vendors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Vendors
        </Link>
        <p className="text-center py-12 text-gray-500">Vendor not found</p>
      </PageLayout>
    );
  }

  const { vendor, products, orders, customers, stats } = data;

  return (
    <PageLayout>
      <Link to="/vendors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Vendors
      </Link>

      {/* Profile Card */}
      <Card className="p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
            <Store size={24} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900">{vendor.name}</h1>
            {vendor.shop_name && <p className="text-sm text-gray-600">{vendor.shop_name}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              {vendor.phone && (
                <span className="flex items-center gap-1"><Phone size={14} /> {vendor.phone}</span>
              )}
              {vendor.location && (
                <span className="flex items-center gap-1"><MapPin size={14} /> {vendor.location}</span>
              )}
              {vendor.vendor_code && (
                <span className="flex items-center gap-1">
                  <Hash size={14} /> <span className="font-mono font-medium text-gray-700">{vendor.vendor_code}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Joined: {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-4 text-center">
          <Package size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{stats.total_products}</p>
          <p className="text-xs text-gray-500">Products</p>
        </Card>
        <Card className="p-4 text-center">
          <ShoppingCart size={20} className="mx-auto text-orange-500 mb-1" />
          <p className="text-2xl font-bold">{stats.total_orders}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
          <p className="text-xs text-gray-500">Revenue</p>
        </Card>
        <Card className="p-4 text-center">
          <Users size={20} className="mx-auto text-purple-500 mb-1" />
          <p className="text-2xl font-bold">{stats.total_customers}</p>
          <p className="text-xs text-gray-500">Customers</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Products' && <ProductsTab products={products} />}
      {tab === 'Orders' && <OrdersTab orders={orders} />}
      {tab === 'Customers' && <CustomersTab customers={customers} />}
    </PageLayout>
  );
}

function ProductsTab({ products }) {
  if (products.length === 0) {
    return <p className="text-center py-8 text-gray-500">No products yet</p>;
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {products.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">{p.name}</span>
              <Badge color="blue">{categoryMap[p.category] || p.category}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{formatCurrency(p.price)}</span>
              <span>Stock: {p.stock ?? '-'}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="py-2.5 font-medium text-gray-900">{p.name}</td>
                <td className="py-2.5">
                  <Badge color="blue">{categoryMap[p.category] || p.category}</Badge>
                </td>
                <td className="py-2.5 text-gray-600">{formatCurrency(p.price)}</td>
                <td className="py-2.5 text-gray-600">{p.stock ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OrdersTab({ orders }) {
  if (orders.length === 0) {
    return <p className="text-center py-8 text-gray-500">No orders yet</p>;
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {orders.map((o) => (
          <Card key={o.id} className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-gray-500">#{o.id?.slice(-6)}</span>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="text-sm text-gray-700">{o.user?.name || 'Unknown'}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{o.order_items?.length || 0} item(s)</span>
              <span className="font-medium">{formatCurrency(o.total_amt)}</span>
            </div>
            <p className="text-xs text-gray-400">
              {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
            </p>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">ID</th>
              <th className="pb-2 font-medium">Customer</th>
              <th className="pb-2 font-medium">Items</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="py-2.5 font-mono text-gray-500">#{o.id?.slice(-6)}</td>
                <td className="py-2.5 text-gray-700">{o.user?.name || 'Unknown'}</td>
                <td className="py-2.5 text-gray-600">{o.order_items?.length || 0}</td>
                <td className="py-2.5 font-medium">{formatCurrency(o.total_amt)}</td>
                <td className="py-2.5"><OrderStatusBadge status={o.status} /></td>
                <td className="py-2.5 text-gray-500">
                  {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CustomersTab({ customers }) {
  if (customers.length === 0) {
    return <p className="text-center py-8 text-gray-500">No customers linked</p>;
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {customers.map((c) => (
          <Card key={c.id} className="p-4">
            <p className="font-medium text-gray-900">{c.name || 'Unnamed'}</p>
            {c.mobile && <p className="text-sm text-gray-500">{c.mobile}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Joined: {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
            </p>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Mobile</th>
              <th className="pb-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-2.5 font-medium text-gray-900">{c.name || 'Unnamed'}</td>
                <td className="py-2.5 text-gray-600">{c.mobile || '-'}</td>
                <td className="py-2.5 text-gray-500">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
