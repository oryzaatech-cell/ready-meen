import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, ClipboardList, User } from 'lucide-react';

const links = [
  { to: '/products/add', icon: PlusCircle, label: 'Add Product' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white/60 backdrop-blur-sm border-r border-surface-200/60 min-h-[calc(100vh-3.5rem)]">
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50/80 text-primary-700 font-semibold shadow-sm shadow-primary-500/5'
                  : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700 active:bg-surface-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-primary-100/60' : 'group-hover:bg-surface-100'}`}>
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="p-4 border-t border-surface-100 flex items-center justify-center">
        <img src="/logo-transparent.png" alt="" className="h-10 w-10 object-contain opacity-50 -mr-2" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
          <span className="text-[6px] font-semibold text-surface-400 tracking-[0.2em] uppercase italic">Vendor</span>
        </div>
      </div>
    </aside>
  );
}
