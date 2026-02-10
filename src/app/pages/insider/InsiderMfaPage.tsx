import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '../../components/remsana';
import remsanaIcon from '../../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { insiderVerifyMfa, getInsiderUser } from '../../api/insider/auth';
import type { InsiderRole } from '../../api/insider/types';

export default function InsiderMfaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = (location.state as { role?: InsiderRole })?.role ?? 'ADMIN';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await insiderVerifyMfa(code);
      const user = getInsiderUser();
      if (user?.role === 'ADMIN') navigate('/insider/admin', { replace: true });
      else navigate('/insider/analyst', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(v);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA /INSIDER</h1>
            <p className="text-[12px] text-[#6B7C7C]">Verify Identity</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-[420px]">
          <CardContent className="p-6 md:p-8">
            <button
              type="button"
              onClick={() => navigate('/insider/login', { state: { role } })}
              className="flex items-center gap-2 text-[14px] text-[#1C1C8B] mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-[22px] font-semibold text-[#1F2121] mb-1">
              REMSANA /INSIDER — Verify Identity
            </h2>
            <p className="text-[14px] text-[#6B7C7C] mb-6">
              A code has been sent to your phone: +234 801 23XX 4567
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-[14px]">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                  Enter code
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={handleChange}
                  placeholder="000000"
                  className="w-full h-[48px] text-center text-[24px] tracking-[0.5em] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1C1C8B] focus:border-transparent"
                />
              </div>
              <Button type="submit" loading={loading} disabled={code.length !== 6} className="w-full">
                VERIFY
              </Button>
            </form>
            <p className="text-[13px] text-[#6B7C7C] mt-4">Use backup code instead</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
