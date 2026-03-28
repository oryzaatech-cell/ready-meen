import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedMobile = localStorage.getItem('readymeen_remembered_mobile');
    if (savedMobile) {
      setMobile(savedMobile);
      setRememberMe(true);
      const savedPw = localStorage.getItem(`readymeen_pw_${savedMobile}`);
      if (savedPw) {
        try { setPassword(atob(savedPw)); } catch (_) {}
      }
    }
    // Clean up old non-user-specific password
    localStorage.removeItem('readymeen_remembered_pw');
  }, []);

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

    if (rememberMe) {
      localStorage.setItem('readymeen_remembered_mobile', mobile.trim());
      localStorage.setItem(`readymeen_pw_${mobile.trim()}`, btoa(password));
    } else {
      localStorage.removeItem('readymeen_remembered_mobile');
      localStorage.removeItem(`readymeen_pw_${mobile.trim()}`);
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
    <div className="min-h-[100dvh] bg-gradient-to-b from-primary-50 via-white to-white flex flex-col px-5 pt-12 pb-8" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}>

      {/* Logo + branding (same as landing page) */}
      <Link to="/" className="flex items-center -ml-7 mb-2 w-fit animate-fade-up">
        <img src="/logo-transparent.png" alt="Ready Meen" className="h-24 w-24 object-contain drop-shadow -mr-6" />
        <div className="flex flex-col items-center">
          <span className="text-sm font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
          <span className="text-[8px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">ready.to.cook</span>
        </div>
      </Link>

      {/* Heading */}
      <div className="mb-8 animate-fade-up delay-100">
        <h1 className="text-3xl font-display font-bold text-gray-900 leading-tight">
          Welcome<br />back
        </h1>
        <p className="text-sm text-gray-400 mt-2">Sign in to continue ordering fresh fish</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up delay-200 flex-1">
        {/* Mobile */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Mobile Number</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <span className="text-sm text-gray-500">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
            Forgot?
          </Link>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Submit */}
        <Button type="submit" loading={loading} className="w-full min-h-[48px] rounded-xl text-sm font-semibold shadow-md shadow-primary-600/15 hover:shadow-lg hover:shadow-primary-600/25 hover:-translate-y-0.5 transition-all duration-300">
          Sign In
        </Button>
      </form>

      {/* Bottom link */}
      <p className="text-sm text-center text-gray-400 mt-8 animate-fade-up delay-300">
        New here?{' '}
        <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  );
}
