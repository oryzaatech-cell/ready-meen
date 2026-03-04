import { Link } from 'react-router-dom';
import { Fish, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { signOut, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200">
              <Fish className="text-white" size={18} />
            </div>
            <span className="font-bold text-gray-900">Ready Meen <span className="text-xs font-medium text-gray-400">Vendor</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="text-sm text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors">Dashboard</Link>
            <Link to="/products" className="text-sm text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors">Products</Link>
            <Link to="/orders" className="text-sm text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors">Orders</Link>
          </div>

          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
                  <User size={20} className="text-gray-600" />
                </Link>
                <button onClick={signOut} className="p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
                  <LogOut size={20} className="text-gray-600" />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-semibold text-emerald-600 px-3 py-2 rounded-xl hover:bg-emerald-50 transition-colors">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
