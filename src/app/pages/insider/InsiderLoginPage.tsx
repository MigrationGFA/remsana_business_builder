import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button, Input, Checkbox, Card, CardContent } from '../../components/remsana';
import remsanaIcon from '../../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { insiderLogin } from '../../api/insider/auth';
import type { InsiderRole } from '../../api/insider/types';

export default function InsiderLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = (location.state as { role?: InsiderRole })?.role ?? 'ADMIN';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await insiderLogin({ email, password, role });
      navigate('/insider/mfa', { state: { role } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = role === 'ADMIN' ? 'Full Administrator' : 'Analyst';

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain cursor-pointer" onClick={() => navigate('/insider')} />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA /INSIDER</h1>
            <p className="text-[12px] text-[#6B7C7C]">Admin Portal — {roleLabel}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-[420px]">
          <CardContent className="p-6 md:p-8">
            <button
              type="button"
              onClick={() => navigate('/insider')}
              className="flex items-center gap-2 text-[14px] text-[#1C1C8B] mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-[22px] font-semibold text-[#1F2121] mb-1">
              REMSANA /INSIDER — {roleLabel}
            </h2>
            <p className="text-[14px] text-[#6B7C7C] mb-6">
              Sign in with your insider account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-[14px]">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@remsana.com"
                    className="w-full h-[40px] pl-10 pr-3 rounded-lg border border-gray-300 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1C1C8B] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[40px] pl-10 pr-10 rounded-lg border border-gray-300 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1C1C8B] focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-[14px] text-[#6B7C7C]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Remember for 7 days
              </label>
              <Button type="submit" loading={loading} className="w-full">
                LOGIN
              </Button>
            </form>
            <p className="text-[13px] text-[#6B7C7C] mt-4">Forgot password?</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
