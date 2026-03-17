import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { code: urlCode } = useParams();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [vendorCode, setVendorCode] = useState(urlCode || '');
  const [vendorName, setVendorName] = useState('');
  const [vendorCodeStatus, setVendorCodeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live-validate vendor code
  useEffect(() => {
    const code = vendorCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setVendorCodeStatus(null);
      setVendorName('');
      return;
    }

    setVendorCodeStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify-vendor-code/${code}`);
        if (res.ok) {
          const data = await res.json();
          setVendorName(data.vendor.shop_name);
          setVendorCodeStatus('valid');
        } else {
          setVendorName('');
          setVendorCodeStatus('invalid');
        }
      } catch {
        setVendorName('');
        setVendorCodeStatus('invalid');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [vendorCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required'); return; }
    if (!mobile.trim() || mobile.trim().length < 10) { setError('Please enter a valid mobile number'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!vendorCode.trim()) { setError('Vendor code is required'); return; }
    if (vendorCodeStatus !== 'valid') { setError('Please enter a valid vendor code'); return; }

    setLoading(true);
    try {
      const metadata = { name: name.trim() };
      metadata.vendor_code = vendorCode.trim().toUpperCase();
      await signUp(mobile.trim(), password, metadata);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-primary-50 via-white to-white flex flex-col px-5 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo + branding (same as landing page) */}
        <Link to="/" className="flex items-center -ml-7 mb-2 w-fit">
          <img src="/logo-transparent.png" alt="Ready Meen" className="h-24 w-24 object-contain drop-shadow -mr-6" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
            <span className="text-[8px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">ready.to.cook</span>
          </div>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900 leading-tight">Create<br />Account</h1>
          <p className="text-sm text-gray-400 mt-2">Join Ready മീൻ to order fresh fish</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Mobile Number" type="tel" placeholder="9876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            <Input label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div>
              <Input
                label="Vendor Code"
                placeholder="e.g. FH3K9X"
                value={vendorCode}
                onChange={(e) => setVendorCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              {vendorCodeStatus === 'checking' && (
                <p className="text-xs text-gray-400 mt-1">Verifying code...</p>
              )}
              {vendorCodeStatus === 'valid' && (
                <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <CheckCircle size={12} /> {vendorName}
                </p>
              )}
              {vendorCodeStatus === 'invalid' && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle size={12} /> Invalid vendor code
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
