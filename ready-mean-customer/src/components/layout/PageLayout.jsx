import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function PageLayout({ children }) {
  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
