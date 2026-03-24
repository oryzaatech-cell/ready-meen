import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: mobile, 2: verify name, 3: new password
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerifyMobile = async (e) => {
    e.preventDefault();
    setError('');
    if (!mobile.trim() || mobile.trim().length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    setStep(2);
  };

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your registered name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed');
        return;
      }
      setStep(3);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.trim(), name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logoBlock = (
    <>
      <Link to="/" className="flex items-center -ml-7 mb-2 w-fit">
        <img src="/logo-transparent.png" alt="Ready Meen" className="h-24 w-24 object-contain drop-shadow -mr-6" />
        <div className="flex flex-col items-center">
          <span className="text-sm font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
          <span className="text-[8px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">ready.to.cook</span>
        </div>
      </Link>
    </>
  );

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-primary-50 via-white to-white flex flex-col px-5 pt-12 pb-8">
        <div className="w-full max-w-sm mx-auto">
          {logoBlock}
          <h1 className="text-3xl font-display font-bold text-gray-900 mt-2">Password<br />Reset</h1>
          <p className="text-sm text-gray-400 mt-2">Your password has been reset successfully.</p>
          <Link to="/login">
            <Button className="w-full mt-6">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-primary-50 via-white to-white flex flex-col px-5 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto">
        {logoBlock}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900 leading-tight">Reset<br />Password</h1>
          <p className="text-sm text-gray-400 mt-2">
            {step === 1 && 'Enter your registered mobile number'}
            {step === 2 && 'Verify your identity'}
            {step === 3 && 'Set your new password'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          {step === 1 && (
            <form onSubmit={handleVerifyMobile} className="space-y-4">
              <Input
                label="Mobile Number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyIdentity} className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the name you used when registering with mobile <span className="font-medium">{mobile}</span>
              </p>
              <Input
                label="Registered Name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">Verify</Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
            <ArrowLeft size={14} />
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
