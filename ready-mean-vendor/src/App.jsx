import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Onboarding from './components/Onboarding';
import OfflineBanner from './components/OfflineBanner';
import UpdateBanner from './components/UpdateBanner';
import Spinner from './components/ui/Spinner';

const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const Dashboard = lazy(() => import('./pages/vendor/Dashboard'));
const Products = lazy(() => import('./pages/vendor/Inventory'));
const AddProduct = lazy(() => import('./pages/vendor/AddInventory'));
const EditProduct = lazy(() => import('./pages/vendor/EditInventory'));
const Orders = lazy(() => import('./pages/vendor/Orders'));
const OrderDetail = lazy(() => import('./pages/vendor/OrderDetail'));
const Profile = lazy(() => import('./pages/vendor/Profile'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  const { loading, isAuthenticated, user } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(false);

  // Check onboarding per vendor (not shared across accounts)
  useEffect(() => {
    if (user?.db_id) {
      setOnboardingDone(!!localStorage.getItem(`vendor_onboarding_done_${user.db_id}`));
    } else {
      setOnboardingDone(false);
    }
  }, [user?.db_id]);

  if (loading) return <PageLoader />;

  return (
    <>
      <UpdateBanner />
      <OfflineBanner />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/products/add" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/products/add" replace />} />
        </Routes>
      </Suspense>

      {/* Onboarding overlay for first-time vendors */}
      {isAuthenticated && !onboardingDone && (
        <Onboarding
          isOpen={true}
          onComplete={() => {
            if (user?.db_id) localStorage.setItem(`vendor_onboarding_done_${user.db_id}`, '1');
            setOnboardingDone(true);
          }}
        />
      )}
    </>
  );
}
