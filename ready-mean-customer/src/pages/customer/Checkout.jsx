import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import AddressCard from '../../components/AddressCard';
import AddressForm from '../../components/AddressForm';
import formatCurrency from '../../shared/formatCurrency';
import { formatAddressText } from '../../shared/formatAddress';

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { get, post } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const { addresses: data } = await get('/addresses');
      setAddresses(data || []);
      // Auto-select the first address
      if (data && data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  const handleAddNewAddress = async (data) => {
    setAddingSaving(true);
    try {
      const { address } = await post('/addresses', data);
      await loadAddresses();
      setSelectedAddress(address);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add address:', err);
    } finally {
      setAddingSaving(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    let shippingAddress = null;
    if (selectedAddress) {
      shippingAddress = formatAddressText(selectedAddress);
    }

    try {
      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        qty: i.qty,
        cutting_type: i.cutting_type || 'whole',
        cleaning: i.cleaning || false,
      }));

      await post('/orders', {
        items: orderItems,
        shipping_address: shippingAddress,
      });

      clearCart();
      navigate('/orders', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-bold">Checkout</h1>

        {/* Address Selection */}
        <Card className="p-4 space-y-3">
          <h3 className="font-medium text-sm">Delivery Address</h3>

          {loadingAddresses ? (
            <p className="text-sm text-gray-400 text-center py-2">Loading addresses...</p>
          ) : (
            <>
              {addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selectable
                      selected={selectedAddress?.id === addr.id}
                      onSelect={setSelectedAddress}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">No saved addresses — add one to continue</p>
              )}

              {addresses.length < 3 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="w-full"
                >
                  <Plus size={15} className="mr-1" />
                  Add New Address
                </Button>
              )}
            </>
          )}
        </Card>

        {/* Summary */}
        <Card className="p-4">
          <h3 className="font-medium text-sm mb-3">Order Summary</h3>
          {items.map((item) => (
            <div key={item.cart_key} className="flex justify-between text-sm py-1">
              <div>
                <span className="text-gray-600">{item.name} x{item.qty} kg</span>
                <div className="flex gap-1 mt-0.5">
                  {item.cutting_type && item.cutting_type !== 'whole' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      {item.cutting_type}
                    </span>
                  )}
                  {item.cleaning && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      Cleaned
                    </span>
                  )}
                </div>
              </div>
              <span>{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t">
            <span>Total</span>
            <span className="text-primary-700">{formatCurrency(totalAmount)}</span>
          </div>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handlePlaceOrder} loading={loading} className="w-full" size="lg">
          Place Order
        </Button>
      </div>

      {/* Add New Address Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Address"
      >
        <AddressForm
          onSubmit={handleAddNewAddress}
          onCancel={() => setShowAddModal(false)}
          loading={addingSaving}
        />
      </Modal>
    </PageLayout>
  );
}
