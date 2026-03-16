import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const tabs = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: true },
  { to: '/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-40 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] px-3 py-1.5 text-[10px] font-medium rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-400 active:bg-gray-50'
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            {badge && itemCount > 0 && (
              <span className="absolute top-0.5 right-1 bg-primary-600 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {itemCount}
              </span>
            )}
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
