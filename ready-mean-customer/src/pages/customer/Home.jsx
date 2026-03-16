import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Fish } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import ProductCard from '../../components/ProductCard';
import Spinner from '../../components/ui/Spinner';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { get } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const handleFocus = () => loadProducts();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const { products: data } = await get('/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = search
    ? products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <PageLayout>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search fish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 shadow-sm transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Results count */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-gray-400 px-1">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'} available
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fish size={28} className="text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">No fish available</h3>
            <p className="text-sm text-gray-400 mt-1">Check back later for fresh stock</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
