import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useActiveOrders } from '../../context/ActiveOrdersContext';

const tabs = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/cart', icon: ShoppingCart, label: 'Cart', badgeKey: 'cart' },
  { to: '/orders', icon: ClipboardList, label: 'Orders', badgeKey: 'orders' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { itemCount } = useCart();
  const { activeCount } = useActiveOrders();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 z-40 md:hidden shadow-[0_-2px_20px_rgba(0,0,0,0.04)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-[66px] max-w-md mx-auto">
        {tabs.map(({ to, icon: Icon, label, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-[3px] min-w-[60px] min-h-[48px] py-1.5 text-[10px] font-medium transition-all duration-200 relative ${
                isActive ? 'text-primary-600' : 'text-gray-400 active:text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary-600 shadow-md shadow-primary-600/25' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.8} className={`transition-colors ${isActive ? 'text-white' : ''}`} />
                  {badgeKey === 'cart' && itemCount > 0 && (
                    <span className={`absolute -top-1.5 -right-1.5 text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 border-white shadow-sm ${isActive ? 'bg-amber-500' : 'bg-primary-600'}`}>
                      {itemCount}
                    </span>
                  )}
                  {badgeKey === 'orders' && activeCount > 0 && (
                    <span className={`absolute -top-1.5 -right-1.5 text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 border-white shadow-sm ${isActive ? 'bg-amber-500' : 'bg-blue-500'}`}>
                      {activeCount}
                    </span>
                  )}
                </div>
                <span className={`${isActive ? 'font-semibold' : ''}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
