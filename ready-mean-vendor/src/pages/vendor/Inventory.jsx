import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, Fish, Pencil, Trash2, Ban, RotateCcw } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ProductListSkeleton } from '../../components/ui/Skeleton';
import ImageZoom from '../../components/ui/ImageZoom';
import formatCurrency from '../../shared/formatCurrency';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { get, put, del } = useApi();

  const loadProducts = useCallback(async () => {
    try {
      const { products: data } = await get('/products/mine');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    const handleFocus = () => loadProducts();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const { PullIndicator } = usePullToRefresh(loadProducts);

  async function handleToggleSold(product) {
    setActionLoading(product.id);
    try {
      const newQty = product.stock_qty <= 0 ? 1 : 0;
      await put('/products/' + product.id, { stock_qty: newQty });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_qty: newQty } : p));
    } catch (err) {
      console.error('Failed to update product:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(productId) {
    setActionLoading(productId);
    try {
      await del('/products/' + productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <PageLayout><div className="animate-slide-up"><div className="flex items-center justify-between mb-1"><div className="h-5 w-40 bg-surface-200/60 rounded-lg animate-pulse" /><div className="h-8 w-16 bg-surface-200/60 rounded-lg animate-pulse" /></div><div className="h-3 w-24 bg-surface-200/60 rounded mt-1.5 mb-4 animate-pulse" /></div><ProductListSkeleton count={3} /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="animate-slide-up">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-lg font-bold text-surface-900">My Products · <span className="text-surface-400 text-sm font-medium">ഉൽപ്പന്നങ്ങൾ</span></h1>
          </div>
          <Link to="/products/add">
            <Button size="sm">
              <PlusCircle size={15} className="mr-1.5" /> Add
            </Button>
          </Link>
        </div>
        <p className="text-xs text-surface-400 mb-4">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
      </div>

      <PullIndicator />

      {products.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-surface-50 to-surface-100 rounded-3xl flex items-center justify-center mx-auto mb-5 ring-1 ring-surface-100 shadow-sm animate-wave-bob">
            <Fish size={32} className="text-surface-300" />
          </div>
          <p className="font-bold text-surface-700 text-base">No products yet</p>
          <p className="text-sm text-surface-400 mt-1.5 mb-6 max-w-[240px] mx-auto">Add your fish products to start receiving orders from customers</p>
          <Link to="/products/add">
            <Button>
              <PlusCircle size={16} className="mr-2" /> Add Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5 animate-fade-in">
          {products.map((product) => (
            <Card key={product.id} className={`p-4 transition-opacity ${product.stock_qty <= 0 ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3.5">
                {/* Image */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-surface-50 to-surface-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-surface-200/50 shadow-sm">
                  {product.image_url ? (
                    <ImageZoom src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Fish size={24} className="text-surface-300" />
                  )}
                  {product.stock_qty <= 0 && (
                    <div className="absolute inset-0 bg-surface-900/60 flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                      <span className="text-[7px] font-bold text-white uppercase tracking-[0.15em] bg-red-500/80 px-2 py-0.5 rounded-full">Sold</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-surface-900 truncate">{product.name}</h3>
                  {product.stock_qty > 0 ? (
                    <p className="text-xs mt-0.5">
                      <span className="font-semibold text-primary-600">{product.stock_qty} kg</span>
                      <span className="text-surface-400"> in stock</span>
                    </p>
                  ) : (
                    <p className="text-xs mt-0.5">
                      <span className="font-semibold text-red-500">Sold Out</span>
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold text-surface-900">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-surface-400">/kg</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-surface-100/80">
                <Link to={`/products/edit/${product.id}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all active:scale-[0.98]">
                    <Pencil size={13} /> Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleToggleSold(product)}
                  disabled={actionLoading === product.id}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all active:scale-[0.98] ${
                    product.stock_qty <= 0
                      ? 'text-primary-700 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-100'
                      : 'text-amber-700 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-100'
                  }`}
                >
                  {product.stock_qty <= 0 ? (
                    <><RotateCcw size={13} /> Restock</>
                  ) : (
                    <><Ban size={13} /> Mark Sold</>
                  )}
                </button>
                {deleteConfirm === product.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={actionLoading === product.id}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-red-200"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-2 text-xs font-semibold text-surface-500 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl ring-1 ring-red-100 transition-all active:scale-[0.98]"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
