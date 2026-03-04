/**
 * ADDON: Auth Complete
 * Copy to: remsana-web/src/app/pages/ForgotPasswordPage.tsx
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button, Input, Alert } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { forgotPassword } from '../api/authApi';
import { hasBackend } from '../api/httpClient';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email format'); return; }
    setIsLoading(true);
    try {
      if (hasBackend()) await forgotPassword(email);
      else await new Promise((r) => setTimeout(r, 1000));
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain cursor-pointer" onClick={() => navigate('/')} />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
            <p className="text-[12px] text-[#6B7C7C]">Build Your Business</p>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[450px]">
          <div className="bg-white rounded-[12px] shadow-lg p-6 md:p-8">
            <button type="button" onClick={() => navigate('/login')} className="flex items-center gap-2 text-[14px] text-[#1C1C8B] mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
            <h2 className="text-[28px] font-semibold text-[#1F2121] mb-2">Forgot password?</h2>
            <p className="text-[14px] text-[#6B7C7C] mb-6">Enter your email and we'll send you a link to reset your password.</p>
            {success ? (
              <div className="space-y-4">
                <Alert variant="success" message="Check your email for a reset link. It may take a few minutes to arrive." />
                <p className="text-[14px] text-[#6B7C7C]">
                  Didn't receive it? <button type="button" onClick={() => setSuccess(false)} className="text-[#1C1C8B] hover:underline">Try again</button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <Alert variant="error" message={error} className="mb-4" />}
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2121] mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
            )}
            <div className="mt-6 text-center">
              <Link to="/login" className="text-[14px] text-[#1C1C8B] font-medium hover:underline">Back to sign in</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
