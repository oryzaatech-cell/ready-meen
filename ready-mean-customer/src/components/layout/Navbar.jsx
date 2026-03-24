import { Link } from 'react-router-dom';
import { LogOut, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import NotificationBell from '../NotificationBell';

export default function Navbar() {
  const { signOut, isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/home" className="flex items-center -ml-3">
            <img src="/logo-transparent.png" alt="Ready Meen" className="h-14 w-14 object-contain drop-shadow -mr-2" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
              <span className="text-[7px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">ready.to.cook</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/home" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Browse</Link>
            <Link to="/orders" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Orders</Link>
          </div>

          <div className="flex items-center gap-1">
            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center mr-1">
              <ShoppingCart size={20} className="text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <NotificationBell />
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
