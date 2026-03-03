import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users as UsersIcon, Mail, Calendar, Shield } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { get } = useApi();

  useEffect(() => {
    get('/admin/users')
      .then(({ users: data }) => setUsers(data || []))
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? users.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Customers ({users.length})</h1>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <UsersIcon size={32} className="mx-auto mb-2 text-gray-300" />
          <p>{search ? 'No customers match your search' : 'No customers yet'}</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((u) => (
              <Link key={u.id} to={`/users/${u.id}`} className="block">
                <div className="bg-white border rounded-lg p-4 space-y-2 hover:ring-2 hover:ring-primary-200 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{u.name || 'Unnamed'}</span>
                    <Badge color={u.is_admin ? 'blue' : 'green'}>
                      {u.is_admin ? 'Admin' : 'Customer'}
                    </Badge>
                  </div>
                  {u.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail size={14} />
                      <span>{u.email}</span>
                    </div>
                  )}
                  {u.provider && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield size={14} />
                      <span className="capitalize">{u.provider}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} />
                    <span>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Provider</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/users/${u.id}`)}>
                    <td className="py-2.5 text-gray-400">{i + 1}</td>
                    <td className="py-2.5 font-medium text-gray-900">{u.name || 'Unnamed'}</td>
                    <td className="py-2.5 text-gray-600">{u.email || '-'}</td>
                    <td className="py-2.5">
                      <span className="capitalize text-gray-500">{u.provider || '-'}</span>
                    </td>
                    <td className="py-2.5">
                      <Badge color={u.is_admin ? 'blue' : 'green'}>
                        {u.is_admin ? 'Admin' : 'Customer'}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageLayout>
  );
}
