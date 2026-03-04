/**
 * ADDON: Auth Complete
 * Copy to: remsana-web/src/app/pages/MfaChallengePage.tsx
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Alert } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { mfaChallenge } from '../api/authApi';

export default function MfaChallengePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const challengeToken = (location.state as { challengeToken?: string })?.challengeToken || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!challengeToken) navigate('/login', { replace: true });
  }, [challengeToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const data = await mfaChallenge(challengeToken, code);
      localStorage.setItem('remsana_auth_token', data.access_token);
      localStorage.setItem('remsana_refresh_token', data.refresh_token || '');
      localStorage.setItem('remsana_user', JSON.stringify({ email: data.user.email, name: data.user.full_name || data.user.email.split('@')[0] }));
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
    setError(null);
  };

  if (!challengeToken) return null;

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain cursor-pointer" onClick={() => navigate('/')} />
          <div><h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1><p className="text-[12px] text-[#6B7C7C]">Verify Identity</p></div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[450px] bg-white rounded-[12px] shadow-lg p-6 md:p-8">
          <button type="button" onClick={() => navigate('/login')} className="flex items-center gap-2 text-[14px] text-[#1C1C8B] mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </button>
          <h2 className="text-[28px] font-semibold text-[#1F2121] mb-2">Two-factor authentication</h2>
          <p className="text-[14px] text-[#6B7C7C] mb-6">Enter the 6-digit code from your authenticator app.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="error" message={error} className="mb-4" />}
            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">Verification code</label>
              <input ref={inputRef} type="text" inputMode="numeric" maxLength={6} value={code} onChange={handleChange} placeholder="000000"
                className="w-full h-[48px] text-center text-[24px] tracking-[0.5em] rounded-lg border border-[#6B7C7C]/30 focus:outline-none focus:ring-2 focus:ring-[#1C1C8B] focus:border-transparent" />
            </div>
            <Button type="submit" loading={loading} disabled={code.length !== 6} className="w-full">Verify</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
