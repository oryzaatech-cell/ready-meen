import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function PageLayout({ children }) {
  return (
    <div className="h-[100dvh] flex flex-col pt-safe pl-safe pr-safe overflow-hidden" style={{ background: 'linear-gradient(170deg, #f0f4f7 0%, #f5f8fa 40%, #eef3f6 100%)' }}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full thin-scrollbar">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
