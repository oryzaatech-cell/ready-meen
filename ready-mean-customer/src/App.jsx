import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/ui/Spinner';

const Landing = lazy(() => import('./pages/public/Landing'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const Home = lazy(() => import('./pages/customer/Home'));
const ProductDetail = lazy(() => import('./pages/customer/ProductDetail'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const Orders = lazy(() => import('./pages/customer/Orders'));
const OrderDetail = lazy(() => import('./pages/customer/OrderDetail'));
const Profile = lazy(() => import('./pages/customer/Profile'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/join/:code" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
