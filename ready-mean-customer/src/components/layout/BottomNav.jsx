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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex items-center justify-around h-16 pb-safe">
        {tabs.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors relative ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} />
            {badge && itemCount > 0 && (
              <span className="absolute -top-1 right-0 bg-primary-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
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
