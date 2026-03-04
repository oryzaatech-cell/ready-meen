import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';
import formatCurrency from '../../shared/formatCurrency';
import { formatDate } from '../../shared/dateUtils';
import { FISH_CATEGORIES } from '../../shared/constants';

const categoryMap = {};
for (const c of FISH_CATEGORIES) categoryMap[c.id] = c.label;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const { get } = useApi();

  const fetchProducts = useCallback((search, cat) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (cat) params.set('category', cat);

    get(`/admin/products?${params.toString()}`)
      .then(({ products: data }) => setProducts(data || []))
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, [get]);

  useEffect(() => {
    fetchProducts('', '');
  }, []);

  function handleSearch() {
    fetchProducts(searchTerm, category);
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleCategoryChange(cat) {
    setCategory(cat);
    fetchProducts(searchTerm, cat);
  }

  return (
    <PageLayout>
      <h1 className="text-xl font-bold mb-4">All Products</h1>

      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Search
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            category === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {FISH_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategoryChange(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === c.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <DashboardSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package size={32} className="mx-auto mb-2 text-gray-300" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={`border-b last:border-0 hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.vendor ? (
                      <Link to={`/vendors/${p.vendor_id}`} className="text-violet-600 hover:underline">
                        {p.vendor.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color="blue">{categoryMap[p.category] || p.category}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${(p.stock_qty ?? p.stock ?? 0) < 5 ? 'text-red-600' : 'text-gray-600'}`}>
                      {p.stock_qty ?? p.stock ?? '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.created_at ? formatDate(p.created_at) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
