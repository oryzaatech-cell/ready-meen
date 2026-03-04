import { useState } from 'react';
import { Store, Phone, MapPin, LogOut } from 'lucide-react';
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
      <div className="max-w-sm mx-auto space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>

        {/* Profile Header */}
        <Card className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-200">
              <Store size={26} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900">{user?.shop_name || user?.name}</p>
              {user?.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                  <Phone size={13} />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                  <MapPin size={13} />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <Button onClick={handleSave} loading={saving} className="w-full mt-5">Save Changes</Button>
        </Card>

        <Button variant="danger" onClick={signOut} className="w-full">
          <LogOut size={16} className="mr-2" /> Sign Out
        </Button>
      </div>
    </PageLayout>
  );
}
