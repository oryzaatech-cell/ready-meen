import { useState } from 'react';
import { Store, Phone, MapPin, LogOut, Shield, Hash } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function VendorProfile() {
  const { user, signOut, saveProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [shopName, setShopName] = useState(user?.shop_name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await saveProfile({
        name: name.trim(),
        role: 'vendor',
        shop_name: shopName.trim() || null,
        location: location.trim() || null,
      });
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-sm mx-auto space-y-4 animate-slide-up">
        <h1 className="text-xl font-bold text-surface-900">Profile</h1>

        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="relative h-20 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 noise-overlay">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          <div className="px-5 pb-5">
            {/* Avatar - overlapping banner */}
            <div className="-mt-8 mb-4 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 ring-4 ring-white">
                <Store size={26} className="text-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-lg text-surface-900">{user?.shop_name || user?.name}</p>
              <div className="flex flex-wrap gap-3">
                {user?.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-surface-500">
                    <Phone size={13} className="text-surface-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center gap-1.5 text-sm text-surface-500">
                    <MapPin size={13} className="text-surface-400" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
              {user?.vendor_code && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold ring-1 ring-primary-100">
                    <Hash size={11} />
                    <span className="font-mono tracking-wider">{user.vendor_code}</span>
                  </span>
                </div>
              )}
              {user?.commission_rate > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-50 text-surface-600 text-xs font-medium ring-1 ring-surface-100">
                    <Shield size={11} />
                    {user.commission_rate}% platform fee
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="p-5">
          <h3 className="font-bold text-sm text-surface-900 mb-4">Edit Details</h3>
          <div className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <Button onClick={handleSave} loading={saving} className="w-full mt-5">Save Changes</Button>
        </Card>

        {/* Sign Out */}
        <Button variant="ghost" onClick={signOut} className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={16} className="mr-2" /> Sign Out
        </Button>
      </div>
    </PageLayout>
  );
}
