import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Phone, Users, Hash } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    get('/admin/vendors')
      .then(({ vendors: data }) => setVendors(data || []))
      .catch((err) => console.error('Failed to load vendors:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  return (
    <PageLayout>
      <h1 className="text-xl font-bold mb-4">Vendors ({vendors.length})</h1>

      {vendors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Store size={32} className="mx-auto mb-2 text-gray-300" />
          <p>No vendors registered</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <Link key={v.id} to={`/vendors/${v.id}`} className="block hover:ring-2 hover:ring-primary-200 rounded-xl transition">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Store size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{v.name}</h3>
                    {v.phone && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <Phone size={12} /> {v.phone}
                      </div>
                    )}
                    {v.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <MapPin size={12} /> {v.location}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-1.5">
                      {v.vendor_code && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Hash size={12} />
                          <span className="font-mono font-medium text-gray-700">{v.vendor_code}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users size={12} />
                        <span>{v.customer_count || 0} customer{v.customer_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined: {v.created_at ? new Date(v.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
