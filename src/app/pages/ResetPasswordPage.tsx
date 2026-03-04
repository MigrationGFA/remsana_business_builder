/**
 * ADDON: Auth Complete
 * Copy to: remsana-web/src/app/pages/ResetPasswordPage.tsx
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Alert } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { resetPassword } from '../api/authApi';
import { hasBackend } from '../api/httpClient';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token && hasBackend()) setError('Invalid or missing reset link. Please request a new one.');
  }, [token]);

  const validatePassword = (p: string) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) { setError('Invalid reset link. Please use the link from your email.'); return; }
    if (!validatePassword(password)) { setError('Password must be at least 8 characters with one uppercase and one number.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    try {
      if (hasBackend()) {
        await resetPassword(token, password);
      } else {
        // Simulate API delay in development
        await new Promise((r) => setTimeout(r, 1000));
      }
      setSuccess(true);
    } catch (err: any) {
      // Handle specific error types with user-friendly messages
      let errorMessage = 'Unable to reset password. Please try again.';
      
      if (err?.message) {
        // Use the specific error message from authApi
        errorMessage = err.message;
      } else if (err?.response?.status === 400) {
        errorMessage = 'This reset link has expired or is invalid. Please request a new reset link.';
      } else if (err?.response?.status === 422) {
        errorMessage = 'Password does not meet security requirements.';
      } else if (err?.response?.status === 429) {
        errorMessage = 'Too many reset attempts. Please wait a few minutes and try again.';
      } else if (err?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!err?.response) {
        errorMessage = 'Unable to connect to server. Check your internet connection and try again.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
        <header className="bg-white shadow-sm py-4 px-4 md:px-8">
          <div className="max-w-[600px] mx-auto flex items-center gap-3">
            <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" onClick={() => navigate('/')} />
            <div><h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1><p className="text-[12px] text-[#6B7C7C]">Build Your Business</p></div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-[450px] bg-white rounded-[12px] shadow-lg p-6 md:p-8">
            <Alert variant="success" message="Your password has been reset. You can now sign in." />
            <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => navigate('/login')}>Sign in</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain cursor-pointer" onClick={() => navigate('/')} />
          <div><h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1><p className="text-[12px] text-[#6B7C7C]">Build Your Business</p></div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[450px]">
          <div className="bg-white rounded-[12px] shadow-lg p-6 md:p-8">
            <h2 className="text-[28px] font-semibold text-[#1F2121] mb-2">Set new password</h2>
            <p className="text-[14px] text-[#6B7C7C] mb-6">Enter your new password below.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert variant="error" message={error} className="mb-4" />}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters, 1 uppercase, 1 number" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C7C]">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading} disabled={isLoading || !token}>
                {isLoading ? 'Resetting...' : 'Reset password'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/login" className="text-[14px] text-[#1C1C8B] font-medium hover:underline">Back to sign in</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

