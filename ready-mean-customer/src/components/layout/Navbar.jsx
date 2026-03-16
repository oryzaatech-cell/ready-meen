import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { signOut, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/home" className="flex items-center gap-2">
            <img src="/logo-transparent.png" alt="Ready Meen" className="h-10 w-10 object-contain" />
            <span className="font-bold text-[#083850]">Ready മീൻ</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/home" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Browse</Link>
            <Link to="/orders" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Orders</Link>
          </div>

          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </Link>
                <button onClick={signOut} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <LogOut size={20} className="text-gray-600" />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-medium text-primary-600">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
