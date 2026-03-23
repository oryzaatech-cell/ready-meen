import { Link, useLocation } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { signOut, isAuthenticated } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/products/add', label: 'Add Product' },
    { to: '/products', label: 'Products' },
    { to: '/orders', label: 'Orders' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="glass border-b border-surface-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link to="/products/add" className="flex items-center group">
            <img src="/logo-transparent.png" alt="Ready Meen" className="h-16 w-16 object-contain drop-shadow -mr-3" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
              <span className="text-[7px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic leading-tight">ready.to.cook</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-primary-700 bg-primary-50/80'
                      : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="p-2 rounded-xl hover:bg-surface-50 active:bg-surface-100 text-surface-400 hover:text-surface-600 transition-all"
                  title="Settings"
                >
                  <Settings size={18} strokeWidth={1.8} />
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 rounded-xl hover:bg-red-50 active:bg-red-100 text-surface-400 hover:text-red-500 transition-all"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-semibold text-primary-600 px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
