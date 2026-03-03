import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Shield, Calendar, ShoppingCart, DollarSign, Store, MapPin, Hash } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import formatCurrency from '../../shared/formatCurrency';

const TABS = ['Orders', 'Addresses'];

export default function UserDetail() {
  const { id } = useParams();
  const { get } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Orders');

  useEffect(() => {
    get(`/admin/users/${id}`)
      .then(setData)
      .catch((err) => console.error('Failed to load user:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  if (!data?.user) {
    return (
      <PageLayout>
        <Link to="/users" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <p className="text-center py-12 text-gray-500">User not found</p>
      </PageLayout>
    );
  }

  const { user, vendor, orders, addresses, stats } = data;

  return (
    <PageLayout>
      <Link to="/users" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      {/* Profile Card */}
      <Card className="p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            <User size={24} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900">{user.name || 'Unnamed'}</h1>
              <Badge color={user.is_admin ? 'blue' : 'green'}>
                {user.is_admin ? 'Admin' : 'Customer'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              {user.email && (
                <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
              )}
              {user.mobile && (
                <span className="flex items-center gap-1"><Phone size={14} /> {user.mobile}</span>
              )}
              {user.provider && (
                <span className="flex items-center gap-1"><Shield size={14} /> <span className="capitalize">{user.provider}</span></span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <Calendar size={12} className="inline mr-1" />
              Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Linked Vendor Card */}
      {vendor && (
        <Link to={`/vendors/${vendor.id}`} className="block mb-4">
          <Card className="p-4 hover:shadow-md transition-shadow border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Store size={20} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Linked Vendor</p>
                <p className="font-medium text-gray-900">{vendor.name}</p>
                <div className="flex flex-wrap gap-x-3 text-sm text-gray-500 mt-0.5">
                  {vendor.shop_name && <span>{vendor.shop_name}</span>}
                  {vendor.vendor_code && (
                    <span className="flex items-center gap-1">
                      <Hash size={12} /> <span className="font-mono">{vendor.vendor_code}</span>
                    </span>
                  )}
                </div>
              </div>
              <ArrowLeft size={16} className="text-gray-300 rotate-180 shrink-0" />
            </div>
          </Card>
        </Link>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="p-4 text-center">
          <ShoppingCart size={20} className="mx-auto text-orange-500 mb-1" />
          <p className="text-2xl font-bold">{stats.total_orders}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-2xl font-bold">{formatCurrency(stats.total_spent)}</p>
          <p className="text-xs text-gray-500">Total Spent</p>
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
      {tab === 'Orders' && <OrdersTab orders={orders} />}
      {tab === 'Addresses' && <AddressesTab addresses={addresses} />}
    </PageLayout>
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

function AddressesTab({ addresses }) {
  if (addresses.length === 0) {
    return <p className="text-center py-8 text-gray-500">No saved addresses</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {addresses.map((a) => (
        <Card key={a.id} className="p-4">
          {a.label && (
            <Badge color="gray" className="mb-2">{a.label}</Badge>
          )}
          <div className="text-sm text-gray-700 space-y-0.5">
            {a.flat_name && <p>{a.flat_name}</p>}
            {(a.number || a.floor) && (
              <p>
                {a.number && `No. ${a.number}`}
                {a.number && a.floor && ', '}
                {a.floor && `Floor ${a.floor}`}
              </p>
            )}
            {a.area && (
              <p className="flex items-center gap-1 text-gray-500">
                <MapPin size={12} /> {a.area}
              </p>
            )}
          </div>
          {(a.contact_name || a.contact_phone) && (
            <div className="mt-2 pt-2 border-t text-sm text-gray-500">
              {a.contact_name && <p>{a.contact_name}</p>}
              {a.contact_phone && (
                <p className="flex items-center gap-1"><Phone size={12} /> {a.contact_phone}</p>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
