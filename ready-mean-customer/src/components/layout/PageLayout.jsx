import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function PageLayout({ children }) {
  return (
    <div className="h-[100dvh] flex flex-col bg-[#f5f7fa] overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full scroll-smooth" style={{ paddingBottom: 'calc(var(--bottom-nav-h, 66px) + env(safe-area-inset-bottom, 0px) + 12px)' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
