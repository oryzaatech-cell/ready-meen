import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShieldCheck, Banknote } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
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

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);
  const paymentMethod = 'cod';

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
      if (data && data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  }

  if (items.length === 0) return null;

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

    if (!selectedAddress) {
      setError('Please select or add a delivery address');
      return;
    }

    setLoading(true);
    const shippingAddress = formatAddressText(selectedAddress);

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
        payment_method: paymentMethod,
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
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-sm text-gray-900">Delivery Address</h3>

          {loadingAddresses ? (
            <p className="text-sm text-gray-400 text-center py-3">Loading addresses...</p>
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
                <p className="text-sm text-gray-400 text-center py-3">No saved addresses — add one to continue</p>
              )}

              {addresses.length < 3 && (
                <Button variant="secondary" size="sm" onClick={() => setShowAddModal(true)} className="w-full rounded-xl min-h-[44px]">
                  <Plus size={15} className="mr-1" />
                  Add New Address
                </Button>
              )}
            </>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Payment Method</h3>
          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary-500 bg-primary-50/40">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Banknote size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">Cash on Delivery</span>
              <p className="text-[11px] text-gray-400 mt-0.5">Pay when your order is delivered</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Order Summary</h3>
          {items.map((item) => (
            <div key={item.cart_key} className="flex justify-between text-sm py-1.5">
              <div>
                <span className="text-gray-700">{item.name}</span>
                <span className="text-gray-400 ml-1">x{item.qty}kg</span>
                <div className="flex gap-1 mt-0.5">
                  {item.cutting_type && item.cutting_type !== 'whole' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-100">
                      {item.cutting_type}
                    </span>
                  )}
                  {item.cleaning && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                      Cleaned
                    </span>
                  )}
                </div>
              </div>
              <span className="font-medium text-gray-700">{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t border-gray-100">
            <span>Total</span>
            <span className="text-primary-700">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 px-1">{error}</p>}

        <Button onClick={handlePlaceOrder} loading={loading} className="w-full min-h-[52px] rounded-xl shadow-md shadow-primary-600/15" size="lg">
          <ShieldCheck size={18} className="mr-2" />
          Place Order
        </Button>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Address">
        <AddressForm onSubmit={handleAddNewAddress} onCancel={() => setShowAddModal(false)} loading={addingSaving} />
      </Modal>
    </PageLayout>
  );
}
