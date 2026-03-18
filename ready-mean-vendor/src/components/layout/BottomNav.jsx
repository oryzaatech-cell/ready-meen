import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, PlusCircle } from 'lucide-react';

const tabs = [
  { to: '/products/add', icon: PlusCircle, label: 'Add', labelMl: 'ചേർക്കുക', end: true },
  { to: '/products', icon: Package, label: 'Products', labelMl: 'ഉൽപ്പന്നങ്ങൾ', end: false },
  { to: '/orders', icon: ClipboardList, label: 'Orders', labelMl: 'ഓർഡറുകൾ', end: false },
  { to: '/', icon: LayoutDashboard, label: 'Home', labelMl: 'ഹോം', end: true },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Soft top edge shadow */}
      <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-black/[0.03] to-transparent pointer-events-none" />

      <div className="glass border-t border-white/60 shadow-[0_-1px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around h-[4.5rem] pb-[env(safe-area-inset-bottom,0px)]">
          {tabs.map(({ to, icon: Icon, label, labelMl, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-[3px] px-4 py-1.5 rounded-2xl transition-all duration-300 min-w-[60px] ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-surface-400 active:text-surface-500 active:scale-95'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-100/80 shadow-sm shadow-primary-500/10 nav-pill-active'
                      : ''
                  }`}>
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 1.7} className="transition-all duration-300" />
                  </div>
                  <span className={`text-[10px] leading-tight transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {label}
                  </span>
                  <span className={`text-[7px] leading-tight transition-opacity duration-200 ${isActive ? 'opacity-70' : 'opacity-40'}`}>
                    {labelMl}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
