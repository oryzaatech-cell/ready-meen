import { Link } from 'react-router-dom';
import { Fish, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { signOut, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <Fish className="text-emerald-600" size={24} />
            <span className="font-bold text-emerald-900">Ready Meen <span className="text-xs font-normal text-gray-500">Vendor</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-emerald-600">Dashboard</Link>
            <Link to="/products" className="text-sm text-gray-600 hover:text-emerald-600">Products</Link>
            <Link to="/orders" className="text-sm text-gray-600 hover:text-emerald-600">Orders</Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-100">
                  <User size={20} className="text-gray-600" />
                </Link>
                <button onClick={signOut} className="p-2 rounded-lg hover:bg-gray-100">
                  <LogOut size={20} className="text-gray-600" />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-medium text-emerald-600">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
