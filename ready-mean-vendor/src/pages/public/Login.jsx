import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedMobile = localStorage.getItem('vendor_remembered_mobile');
    if (savedMobile) {
      setMobile(savedMobile);
      setRemember(true);
      const savedPw = localStorage.getItem(`vendor_pw_${savedMobile}`);
      if (savedPw) {
        try { setPassword(atob(savedPw)); } catch (_) {}
      }
    }
    // Clean up old non-user-specific password
    localStorage.removeItem('vendor_remembered_pw');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!mobile.trim() || mobile.trim().length < 10) { setError('Please enter a valid mobile number'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }

    if (remember) {
      localStorage.setItem('vendor_remembered_mobile', mobile.trim());
      localStorage.setItem(`vendor_pw_${mobile.trim()}`, btoa(password));
    } else {
      localStorage.removeItem('vendor_remembered_mobile');
      localStorage.removeItem(`vendor_pw_${mobile.trim()}`);
    }

    setLoading(true);
    try {
      await signIn(mobile.trim(), password);
      navigate('/products/add', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
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
          Welcome<br />back
        </h1>
        <p className="text-sm text-surface-500 font-medium mb-10">
          Sign in to manage your store · സ്റ്റോർ മാനേജ് ചെയ്യാൻ സൈൻ ഇൻ ചെയ്യൂ
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up stagger-2">
        <Input
          label="Mobile Number"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
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

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-surface-600 font-medium">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Forgot?
          </Link>
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
          Sign In
        </Button>
      </form>

      {/* Bottom link */}
      <div className="animate-slide-up stagger-3 mt-10">
        <p className="text-sm text-surface-500 text-center">
          New here?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Register as vendor
          </Link>
        </p>
      </div>
    </div>
  );
}
