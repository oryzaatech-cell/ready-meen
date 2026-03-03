import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fish, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { unlockGate } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter the access password');
      return;
    }

    setLoading(true);
    try {
      await unlockGate(password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Fish className="text-violet-600 mx-auto" size={40} />
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Ready Meen</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Lock size={16} />
            <span>Enter the admin access password</span>
          </div>

          <Input
            label="Access Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Enter Admin Panel
          </Button>
        </form>
      </div>
    </div>
  );
}
