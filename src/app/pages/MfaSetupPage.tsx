/**
 * ADDON: Auth Complete
 * Copy to: remsana-web/src/app/pages/MfaSetupPage.tsx
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button, Alert } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { mfaSetup, mfaVerifySetup, mfaDisable } from '../api/authApi';
import { hasBackend } from '../api/httpClient';

export default function MfaSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'qr' | 'verify' | 'already_enabled'>('qr');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('remsana_auth_token')) { navigate('/login', { replace: true }); return; }
    if (!hasBackend()) { setError('2FA is only available when connected to the backend.'); return; }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await mfaSetup();
        setQrUrl(data.qr_url);
        setSecret(data.secret);
        setStep('qr');
      } catch (err: any) {
        // If MFA is already enabled, backend may return 409 or similar
        if (err?.response?.status === 409 || err?.response?.data?.message?.toLowerCase().includes('already')) {
          setStep('already_enabled');
        } else {
          setError(err?.response?.data?.message || err?.message || 'Failed to load setup.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await mfaVerifySetup(code);
      setSuccess('Two-factor authentication enabled successfully!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[720px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain cursor-pointer" onClick={() => navigate('/dashboard')} />
          <div><h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1><p className="text-[12px] text-[#6B7C7C]">Security</p></div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[450px] bg-white rounded-[12px] shadow-lg p-6 md:p-8">
          <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[14px] text-[#1C1C8B] mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </button>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-[#1C1C8B]" />
            <h2 className="text-[24px] font-semibold text-[#1F2121]">Set up two-factor authentication</h2>
          </div>
          <p className="text-[14px] text-[#6B7C7C] mb-6">Add an extra layer of security. Use an authenticator app (Google Authenticator, Authy, etc.) to scan the QR code.</p>
          {error && <Alert variant="error" message={error} className="mb-4" />}
          {success && <Alert variant="success" message={success} className="mb-4" />}
          {loading && !qrUrl && step !== 'already_enabled' ? <p className="text-[14px] text-[#6B7C7C]">Loading...</p> : step === 'already_enabled' ? (
            <div className="space-y-4">
              <Alert variant="info" message="Two-factor authentication is already enabled on your account." className="mb-2" />
              <p className="text-[14px] text-[#6B7C7C]">To disable 2FA, enter your account password below:</p>
              <input type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} placeholder="Enter your password"
                className="w-full h-[48px] rounded-lg border border-[#6B7C7C]/30 px-4 focus:outline-none focus:ring-2 focus:ring-[#1C1C8B]" />
              <Button onClick={async () => {
                if (!disablePassword) { setError('Please enter your password'); return; }
                setLoading(true); setError(null);
                try {
                  await mfaDisable(disablePassword);
                  setSuccess('Two-factor authentication has been disabled.');
                  setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
                } catch (err: any) {
                  setError(err?.response?.data?.message || err?.message || 'Failed to disable 2FA. Check your password.');
                } finally { setLoading(false); }
              }} loading={loading} disabled={!disablePassword} className="w-full" variant="danger">Disable 2FA</Button>
            </div>
          ) : step === 'qr' && qrUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} alt="QR code" className="w-[200px] h-[200px]" />
              </div>
              <p className="text-[12px] text-[#6B7C7C]">Can't scan? Enter manually: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code></p>
              <Button onClick={() => setStep('verify')} className="w-full">I've scanned the code</Button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">Enter the 6-digit code from your app</label>
                <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"
                  className="w-full h-[48px] text-center text-[24px] tracking-[0.5em] rounded-lg border border-[#6B7C7C]/30 focus:outline-none focus:ring-2 focus:ring-[#1C1C8B]" />
              </div>
              <Button type="submit" loading={loading} disabled={code.length !== 6} className="w-full">Enable 2FA</Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
