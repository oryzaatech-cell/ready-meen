import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function PageLayout({ children }) {
  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50/80 pt-safe pl-safe pr-safe overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
