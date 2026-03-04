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
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-gray-900">My Products</h1>
        <Link to="/products/add">
          <Button size="sm">
            <PlusCircle size={16} className="mr-1.5" /> Add Product
          </Button>
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-4">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600">No products yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Add your fish products to start receiving orders</p>
          <Link to="/products/add">
            <Button size="sm">
              <PlusCircle size={16} className="mr-1.5" /> Add Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <Card key={product.id} className={`p-4 flex items-center gap-3 ${product.stock_qty <= 0 ? 'opacity-70' : ''}`}>
              <div className="relative w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-gray-200/60">
                {product.image_url ? (
                  <ImageZoom src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Fish size={22} className="text-gray-300" />
                )}
                {product.stock_qty <= 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                    <span className="text-[8px] font-bold text-white uppercase">Sold</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{product.name}</h3>
                {product.stock_qty > 0 ? (
                  <p className="text-xs mt-0.5">
                    <span className="font-medium text-emerald-600">{product.stock_qty} kg</span>
                    <span className="text-gray-500"> in stock</span>
                  </p>
                ) : (
                  <p className="text-xs mt-0.5">
                    <span className="font-semibold text-red-500">Sold Out</span>
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs text-gray-400">/kg</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
