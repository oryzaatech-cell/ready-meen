import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
