import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fish } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required'); return; }
    if (!mobile.trim() || mobile.trim().length < 10) { setError('Please enter a valid mobile number'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await signUp(mobile.trim(), password, {
        name: name.trim(),
        shop_name: shopName.trim() || null,
        location: location.trim() || null,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Fish className="text-emerald-600 mx-auto" size={40} />
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Vendor Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Join Ready Meen as a fish vendor</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Mobile Number" type="tel" placeholder="9876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            <Input label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Shop Name" placeholder="Your fish shop name (optional)" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            <Input label="Location" placeholder="Market/area name (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">Create Vendor Account</Button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
