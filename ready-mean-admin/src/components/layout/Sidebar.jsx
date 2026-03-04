import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Store, ClipboardList, BarChart3, Package } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/vendors', icon: Store, label: 'Vendors' },
  { to: '/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)]">
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
