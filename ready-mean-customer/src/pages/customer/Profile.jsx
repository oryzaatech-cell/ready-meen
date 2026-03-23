import { useState, useEffect } from 'react';
import { User, Phone, LogOut, Plus, MapPin, Check, Pencil, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import AddressForm from '../../components/AddressForm';
import AddressCard from '../../components/AddressCard';

const MAX_ADDRESSES = 3;

export default function CustomerProfile() {
  const { user, signOut, saveProfile } = useAuth();
  const navigate = useNavigate();
  const { get, post, put, del } = useApi();
  const [name, setName] = useState(user?.name || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => { loadAddresses(); }, []);

  async function loadAddresses() {
    try { const { addresses: data } = await get('/addresses'); setAddresses(data || []); }
    catch (err) { console.error('Failed to load addresses:', err); }
    finally { setLoadingAddresses(false); }
  }

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await saveProfile({ name: name.trim(), role: user.role });
      setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error('Save failed:', err); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async (data) => {
    setAddressSaving(true);
    try { await post('/addresses', data); await loadAddresses(); setShowAddressModal(false); }
    catch (err) { console.error('Failed to add address:', err); }
    finally { setAddressSaving(false); }
  };

  const handleEditAddress = async (data) => {
    setAddressSaving(true);
    try { await put(`/addresses/${editingAddress.id}`, data); await loadAddresses(); setEditingAddress(null); }
    catch (err) { console.error('Failed to update address:', err); }
    finally { setAddressSaving(false); }
  };

  const handleDeleteAddress = async (addr) => {
    try { await del(`/addresses/${addr.id}`); setAddresses((prev) => prev.filter((a) => a.id !== addr.id)); }
    catch (err) { console.error('Failed to delete address:', err); }
  };

  return (
    <PageLayout>
      <div className="max-w-sm mx-auto space-y-3 pb-28 md:pb-20">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors min-h-[44px]">
          <ChevronLeft size={18} />
          Back
        </button>

        <h1 className="text-xl font-bold text-gray-900">Profile</h1>

        {/* User card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
              <User size={22} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 text-sm font-semibold text-gray-900 border-b-2 border-primary-500 focus:outline-none py-0.5 bg-transparent" autoFocus />
                  <button onClick={handleSave} disabled={saving} className="text-primary-600 hover:text-primary-700 p-1">
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 text-sm truncate">{saved ? 'Saved!' : user?.name}</p>
                  <button onClick={() => setEditing(true)} className="text-gray-300 hover:text-primary-500 transition-colors p-0.5">
                    <Pencil size={12} />
                  </button>
                </div>
              )}
              {user?.mobile && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <Phone size={11} />
                  <span>{user.mobile}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-primary-600" />
              <h2 className="text-sm font-bold text-gray-900">Addresses</h2>
            </div>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{addresses.length}/{MAX_ADDRESSES}</span>
          </div>

          {loadingAddresses ? (
            <p className="text-xs text-gray-400 text-center py-4">Loading...</p>
          ) : addresses.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No saved addresses</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <AddressCard key={addr.id} address={addr} onEdit={(a) => setEditingAddress(a)} onDelete={handleDeleteAddress} />
              ))}
            </div>
          )}

          {addresses.length < MAX_ADDRESSES && (
            <Button variant="secondary" size="sm" onClick={() => setShowAddressModal(true)} className="w-full rounded-xl min-h-[44px]">
              <Plus size={16} className="mr-1" /> Add Address
            </Button>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:bg-red-50 hover:border-red-100 transition-all duration-200 group"
        >
          <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-medium text-gray-600 group-hover:text-red-600 transition-colors">Sign Out</span>
        </button>
      </div>

      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Add Address">
        <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddressModal(false)} loading={addressSaving} />
      </Modal>
      <Modal isOpen={!!editingAddress} onClose={() => setEditingAddress(null)} title="Edit Address">
        {editingAddress && <AddressForm initial={editingAddress} onSubmit={handleEditAddress} onCancel={() => setEditingAddress(null)} loading={addressSaving} />}
      </Modal>
    </PageLayout>
  );
}
