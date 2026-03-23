import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[100dvh] bg-gradient-to-b from-primary-50/40 via-white to-white px-6 py-10 overflow-hidden" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 0px))' }}>

      {/* Logo — top left */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-0 mb-10">
          <img src="/logo-transparent.png" alt="Ready Meen" className="h-16 w-16 object-contain drop-shadow-lg -mr-3" />
          <div className="flex flex-col">
            <span className="text-base font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">
              Ready മീൻ
            </span>
            <span className="text-[7px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">
              ready.to.cook
            </span>
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="animate-slide-up stagger-1">
        <h1 className="text-4xl font-extrabold text-surface-900 leading-[1.1] tracking-tight mb-3">
          Create<br />account
        </h1>
        <p className="text-sm text-surface-500 font-medium mb-10">
          Start selling fresh fish online · ഫ്രഷ് മീൻ ഓൺലൈൻ വിൽക്കൂ
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up stagger-2">
        <Input
          label="Full Name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Mobile Number"
          type="tel"
          placeholder="9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Optional fields */}
        <div className="pt-4 border-t border-surface-100/60">
          <p className="text-[11px] text-surface-400 mb-4 font-medium">
            Optional · പിന്നീട് ചേർക്കാം
          </p>
          <div className="space-y-5">
            <Input
              label="Shop Name"
              placeholder="Your fish shop name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
            <Input
              label="Location"
              placeholder="Market/area name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50/80 text-red-600 text-sm px-3.5 py-2.5 rounded-xl border border-red-100 font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full hover:shadow-lg hover:shadow-primary-600/20 transition-shadow"
          size="lg"
        >
          Create Vendor Account
        </Button>
      </form>

      {/* Bottom link */}
      <div className="animate-slide-up stagger-3 mt-10">
        <p className="text-sm text-surface-500 text-center">
          Already a vendor?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
