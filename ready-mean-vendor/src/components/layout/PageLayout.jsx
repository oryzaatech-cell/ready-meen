import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50/80 pt-safe pl-safe pr-safe">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
