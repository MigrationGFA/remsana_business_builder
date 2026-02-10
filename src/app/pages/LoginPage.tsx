import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Checkbox, Alert } from '../components/remsana';
import { LegalModals } from '../components/remsana/LegalModals';
import { TestLoginHelper } from '../components/TestLoginHelper';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { api, hasBackend } from '../api/httpClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    // If a backend base URL is configured, prefer calling the real API.
    if (hasBackend()) {
      try {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        const data = response.data;
        localStorage.setItem('remsana_auth_token', data.access_token || '');
        localStorage.setItem(
          'remsana_user',
          JSON.stringify({
            email: data.user?.email ?? formData.email,
            name: data.user?.name ?? formData.email.split('@')[0],
          })
        );
        setIsLoading(false);
        navigate('/dashboard');
        return;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to sign in. Please try again.';
        setError(message);
        setIsLoading(false);
        return;
      }
    }

    // Fallback: local test credentials for development (no backend)
    // Test credentials from environment (for development only)
    const testCredentialsEnv = import.meta.env.VITE_TEST_CREDENTIALS;
    const testCredentials = testCredentialsEnv
      ? JSON.parse(testCredentialsEnv)
      : [
          // Default fallback (should be removed in production)
          { email: 'test@remsana.com', password: 'Test1234!' },
          { email: 'smeowner@business.ng', password: 'Business2026!' },
          { email: 'demo@remsana.com', password: 'Demo1234!' },
        ];

    // Check if using test credentials
    const isValidTestCredential = testCredentials.some(
      (cred) => cred.email === formData.email && cred.password === formData.password
    );

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      if (isValidTestCredential || formData.password.length >= 8) {
        // Store user info for testing
        localStorage.setItem('remsana_user', JSON.stringify({
          email: formData.email,
          name: formData.email.split('@')[0],
        }));
        localStorage.setItem('remsana_auth_token', 'test_token_' + Date.now());
        
        // Navigate to dashboard on success
        navigate('/dashboard');
      } else {
        setError('Invalid email/phone or password');
      }
    }, 1500);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img 
            src={remsanaIcon} 
            alt="REMSANA" 
            className="w-10 h-10 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
            <p className="text-[12px] text-[#6B7C7C]">Build Your Business</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[450px]">
          <div className="bg-white rounded-[12px] shadow-lg p-6 md:p-8">
            <h2 className="text-[28px] font-semibold text-[#1F2121] mb-2">
              Welcome Back
            </h2>
            <p className="text-[14px] text-[#6B7C7C] mb-6">
              Sign in to continue your business journey
            </p>

            {error && (
              <Alert variant="error" message={error} className="mb-4" />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email/Phone Input */}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                  Email or Phone
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
                  <Input
                    type="text"
                    placeholder="Enter email or phone number"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C7C] hover:text-[#1C1C8B]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={(checked) => handleChange('rememberMe', checked)}
                    label="Remember me for 30 days"
                  />
                  <Link 
                    to="/forgot-password" 
                    className="text-[12px] text-[#1C1C8B] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-[14px] text-[#6B7C7C]">
                New user?{' '}
                <Link to="/signup" className="text-[#1C1C8B] font-medium hover:underline">
                  Sign up here
                </Link>
              </p>
              <div className="flex items-center justify-center gap-4 text-[12px] text-[#6B7C7C]">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-[#1C1C8B] cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-[#1C1C8B] cursor-pointer"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Test Login Helper - Development only */}
      <TestLoginHelper />

      {/* Legal Modals */}
      <LegalModals
        showTerms={showTermsModal}
        showPrivacy={showPrivacyModal}
        showHelp={showHelpModal}
        onCloseTerms={() => setShowTermsModal(false)}
        onClosePrivacy={() => setShowPrivacyModal(false)}
        onCloseHelp={() => setShowHelpModal(false)}
      />
    </div>
  );
}
