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
      if (hasBackend()) {
        await forgotPassword(email);
      } else {
        // Simulate API delay in development
        await new Promise((r) => setTimeout(r, 1000));
      }
      // Always show success for security (don't reveal if email exists)
      setSuccess(true);
    } catch (err: any) {
      // Handle specific error types with user-friendly messages
      let errorMessage = 'Unable to process your request. Please try again.';
      
      if (err?.message) {
        // Use the specific error message from authApi
        errorMessage = err.message;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 py-3 px-4 sm:px-6">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-9 h-9 object-contain cursor-pointer" onClick={() => navigate('/')} />
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">REMSANA</h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">Business Builder</p>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#1C1C8B] to-[#667eea]" />
            <div className="p-6 sm:p-8">
              <button type="button" onClick={() => navigate('/login')} className="flex items-center gap-1.5 text-sm text-[#1C1C8B] font-medium mb-5 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h2>
              <p className="text-sm text-gray-400 mb-6">Enter your email and we'll send you a link to reset your password.</p>
              {success ? (
                <div className="space-y-4">
                  <Alert variant="success" message="Check your email for a reset link. It may take a few minutes to arrive." />
                  <p className="text-sm text-gray-400">
                    Didn't receive it? <button type="button" onClick={() => setSuccess(false)} className="text-[#1C1C8B] font-medium hover:underline">Try again</button>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <Alert variant="error" message={error} className="mb-4" />}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="w-full !rounded-xl" loading={isLoading} disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </form>
              )}
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-[#1C1C8B] font-semibold hover:underline">Back to sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
