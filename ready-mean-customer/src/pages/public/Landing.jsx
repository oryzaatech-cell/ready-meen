import { Link } from 'react-router-dom';
import { Fish, ShoppingBag, Truck, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

const features = [
  { icon: Fish, title: 'Fresh Daily', desc: 'Fish sourced fresh every morning from local markets' },
  { icon: ShoppingBag, title: 'Easy Ordering', desc: 'Browse, select cutting style, and order in minutes' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Delivery or pickup — your choice, your convenience' },
  { icon: Shield, title: 'Quality Assured', desc: 'Verified vendors with quality-checked products' },
];

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const homeLink = isAuthenticated
    ? user?.role === 'vendor' ? '/vendor' : user?.role === 'admin' ? '/admin' : '/home'
    : '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Fish className="text-primary-600" size={28} />
          <span className="text-xl font-bold text-primary-900">Ready Meen</span>
        </div>
        <Link to={homeLink}>
          <Button>{isAuthenticated ? 'Go to App' : 'Get Started'}</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Fresh Fish,<br />
          <span className="text-primary-600">Delivered to You</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Order fresh fish from trusted local vendors. Choose your cutting style, schedule delivery, and enjoy the freshest catch.
        </p>
        <Link to={homeLink} className="mt-8 inline-block">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={24} className="text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        Ready Meen &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
