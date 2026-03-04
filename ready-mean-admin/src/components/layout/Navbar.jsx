import { Link } from 'react-router-dom';
import { Fish, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { signOut, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <Fish className="text-violet-600" size={24} />
            <span className="font-bold text-violet-900">Ready Meen <span className="text-xs font-normal text-gray-500">Admin</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-violet-600">Dashboard</Link>
            <Link to="/users" className="text-sm text-gray-600 hover:text-violet-600">Users</Link>
            <Link to="/vendors" className="text-sm text-gray-600 hover:text-violet-600">Vendors</Link>
            <Link to="/orders" className="text-sm text-gray-600 hover:text-violet-600">Orders</Link>
            <Link to="/products" className="text-sm text-gray-600 hover:text-violet-600">Products</Link>
            <Link to="/analytics" className="text-sm text-gray-600 hover:text-violet-600">Analytics</Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button onClick={signOut} className="p-2 rounded-lg hover:bg-gray-100">
                <LogOut size={20} className="text-gray-600" />
              </button>
            ) : (
              <Link to="/login" className="text-sm font-medium text-violet-600">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
