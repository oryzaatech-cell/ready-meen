import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fish } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mobile.trim() || mobile.trim().length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signIn(mobile.trim(), password);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Fish className="text-primary-600 mx-auto" size={40} />
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Ready Meen</h1>
          <p className="text-sm text-gray-500 mt-1">Fresh fish, delivered fast</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>

            <p className="text-sm text-right">
              <Link to="/forgot-password" className="text-primary-600 font-medium hover:underline">
                Forgot Password?
              </Link>
            </p>
          </form>

          <p className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
