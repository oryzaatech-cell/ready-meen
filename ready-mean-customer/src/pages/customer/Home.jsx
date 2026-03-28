import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Fish, X, Waves, ShoppingBag } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { useRealtime } from '../../context/RealtimeContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PageLayout from '../../components/layout/PageLayout';
import ProductCard from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { get } = useApi();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { productVersion } = useRealtime();
  const navigate = useNavigate();

  const loadProducts = useCallback(async () => {
    try {
      const { products: data } = await get('/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [productVersion]);

  useEffect(() => {
    const handleFocus = () => loadProducts();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const { PullIndicator } = usePullToRefresh(loadProducts);

  const filtered = search
    ? products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    : products;

  const firstName = user?.name?.split(' ')[0] || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <PageLayout>
      <PullIndicator />
      <div className="space-y-5">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-[#0c5a5a] p-5 pb-6 text-white animate-fade-up">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-lg" />
          <div className="absolute top-3 right-4 opacity-[0.07]">
            <Fish size={80} className="rotate-[-15deg]" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-1.5 text-primary-200/70 text-[10px] uppercase tracking-[0.15em] font-semibold mb-1">
              <Waves size={12} />
              {greeting}
            </div>
            <h1 className="text-[1.6rem] font-display font-bold leading-tight tracking-tight">
              {firstName ? <>Hi, {firstName}</> : 'Fresh Market'}
            </h1>
            <p className="text-primary-100/60 text-[13px] mt-1 leading-relaxed">
              Fresh fish from your trusted local vendor
            </p>
          </div>

          {/* Search inside banner */}
          <div className="relative mt-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search fresh fish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:bg-white/15 focus:border-white/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick stat */}
          {itemCount > 0 && (
            <button onClick={() => navigate('/cart')} className="mt-3 inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white/80 transition-all">
              <ShoppingBag size={13} />
              {itemCount} in cart
            </button>
          )}
        </div>

        {/* Section header */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between animate-fade-up delay-100">
            <h2 className="text-[15px] font-bold text-gray-800">
              {search ? `Results for "${search}"` : 'Available Today'}
            </h2>
            <span className="text-[11px] text-gray-400 font-medium bg-gray-100 px-2.5 py-0.5 rounded-full">{filtered.length}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-up">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Fish size={32} className="text-primary-300" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              {search ? 'No results found' : 'No fish available right now'}
            </h3>
            <p className="text-sm text-gray-400 mt-1.5 max-w-[260px] mx-auto">
              {search ? `We couldn't find "${search}"` : 'Fresh stock arrives daily from your vendor'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-4 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-up delay-200">
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
