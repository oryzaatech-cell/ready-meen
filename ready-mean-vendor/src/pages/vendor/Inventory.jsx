import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, Fish } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ImageZoom from '../../components/ui/ImageZoom';
import formatCurrency from '../../shared/formatCurrency';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  function loadProducts() {
    get('/products/mine')
      .then(({ products: data }) => setProducts(data || []))
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Re-fetch when vendor navigates back to this page
  useEffect(() => {
    const handleFocus = () => loadProducts();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) {
    return <PageLayout><div className="flex justify-center py-12"><Spinner /></div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Products</h1>
        <Link to="/products/add">
          <Button size="sm">
            <PlusCircle size={16} className="mr-1" /> Add Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package size={32} className="mx-auto mb-2 text-gray-300" />
          <p>No products yet</p>
          <p className="text-xs mt-1">Add your fish products to start receiving orders</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <Card key={product.id} className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {product.image_url ? (
                  <ImageZoom src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Fish size={20} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{product.name}</h3>
                <p className="text-xs text-gray-500">
                  {product.category || 'Uncategorized'} &middot; {product.stock_qty} kg in stock
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-primary-700">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs text-gray-500">/kg</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
