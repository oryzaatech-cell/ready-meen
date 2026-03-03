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
        <h1 className="text-xl font-bold">Vendor Profile</h1>

        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
              <Store size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold">{user?.shop_name || user?.name}</p>
              {user?.phone && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Phone size={12} />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.location && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={12} />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>

          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

          <Button onClick={handleSave} loading={saving} className="w-full">Save Changes</Button>
        </Card>

        <Button variant="danger" onClick={signOut} className="w-full">
          <LogOut size={16} className="mr-2" /> Sign Out
        </Button>
      </div>
    </PageLayout>
  );
}
