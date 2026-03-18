import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      await signUp(mobile.trim(), password, { name: name.trim(), shop_name: shopName.trim() || null, location: location.trim() || null });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #e8f0f5 0%, #f0f6f4 30%, #eef4f8 60%, #f5f8fa 100%)' }} />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(6,198,178,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(6,198,178,0.1) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10 animate-slide-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <img src="/logo-transparent.png" alt="Ready Meen" className="h-24 w-24 object-contain drop-shadow-lg -mr-5" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
              <span className="text-[8px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">ready.to.cook</span>
            </div>
          </div>
          <p className="text-sm text-surface-500 font-medium">Start selling fresh fish online</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] border border-white/80 p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Mobile Number" type="tel" placeholder="9876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            <Input label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="pt-3 border-t border-surface-100/60">
              <p className="text-[11px] text-surface-400 mb-3 font-medium">Optional — you can add these later</p>
              <div className="space-y-4">
                <Input label="Shop Name" placeholder="Your fish shop name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
                <Input label="Location" placeholder="Market/area name" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50/80 text-red-600 text-sm px-3.5 py-2.5 rounded-xl border border-red-100 font-medium">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">Create Vendor Account</Button>
          </form>

          <p className="text-sm text-center text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
