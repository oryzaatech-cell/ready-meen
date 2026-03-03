import { useState, useEffect } from 'react';
import { User, Phone, LogOut, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import AddressForm from '../../components/AddressForm';
import AddressCard from '../../components/AddressCard';

const MAX_ADDRESSES = 3;

export default function CustomerProfile() {
  const { user, signOut, saveProfile } = useAuth();
  const { get, post, put, del } = useApi();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const { addresses: data } = await get('/addresses');
      setAddresses(data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await saveProfile({ name: name.trim(), role: user.role });
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (data) => {
    setAddressSaving(true);
    try {
      await post('/addresses', data);
      await loadAddresses();
      setShowAddressModal(false);
    } catch (err) {
      console.error('Failed to add address:', err);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleEditAddress = async (data) => {
    setAddressSaving(true);
    try {
      await put(`/addresses/${editingAddress.id}`, data);
      await loadAddresses();
      setEditingAddress(null);
    } catch (err) {
      console.error('Failed to update address:', err);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addr) => {
    try {
      await del(`/addresses/${addr.id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-sm mx-auto space-y-4">
        <h1 className="text-xl font-bold">Profile</h1>

        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              {user?.mobile && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Phone size={12} />
                  <span>{user.mobile}</span>
                </div>
              )}
            </div>
          </div>

          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button onClick={handleSave} loading={saving} className="w-full">
            Save Changes
          </Button>
        </Card>

        {/* Saved Addresses */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary-600" />
              <h2 className="font-semibold">Saved Addresses</h2>
            </div>
            <span className="text-xs text-gray-500">{addresses.length} / {MAX_ADDRESSES}</span>
          </div>

          {loadingAddresses ? (
            <p className="text-sm text-gray-400 text-center py-3">Loading...</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">No saved addresses</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={(a) => setEditingAddress(a)}
                  onDelete={handleDeleteAddress}
                />
              ))}
            </div>
          )}

          {addresses.length < MAX_ADDRESSES && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddressModal(true)}
              className="w-full"
            >
              <Plus size={16} className="mr-1" />
              Add Address
            </Button>
          )}
        </Card>

        <Button variant="danger" onClick={signOut} className="w-full">
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add Address"
      >
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setShowAddressModal(false)}
          loading={addressSaving}
        />
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        isOpen={!!editingAddress}
        onClose={() => setEditingAddress(null)}
        title="Edit Address"
      >
        {editingAddress && (
          <AddressForm
            initial={editingAddress}
            onSubmit={handleEditAddress}
            onCancel={() => setEditingAddress(null)}
            loading={addressSaving}
          />
        )}
      </Modal>
    </PageLayout>
  );
}
