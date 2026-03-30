import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button, Input, Checkbox, Alert } from '../components/remsana';
import { LegalModals } from '../components/remsana/LegalModals';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { useAuth } from '../context/AuthContext';
import { validatePasswordStrength } from '../services/authService';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    phoneCountry: '+234',
    password: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  /**
   * Validate password
   * Now requires special character (not optional)
   */
  const validatePassword = (password: string): boolean => {
    const validation = validatePasswordStrength(password);
    return validation.isValid;
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    validatePassword(value);
  };

 /**
   * Handle form submission
   * 
   * Validates all fields, calls signup via AuthContext,
   * and redirects to onboarding on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    setSuccessMessage(null);
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    // Full name validation (3-50 characters)
    if (formData.fullName.length < 3 || formData.fullName.length > 50) {
      newErrors.fullName = 'Enter a valid name (3-50 characters)';
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Nigerian phone validation (10 digits)
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      newErrors.phone = 'Enter a valid 10-digit Nigerian phone number';
    }
    
    // Password validation (now requires special character)
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
    }
    
    // Terms acceptance validation
    if (!formData.termsAccepted) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }
    
    // If validation errors exist, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Call signup via AuthContext
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone_number: formData.phoneCountry + cleanPhone,
      });
      
      console.log('Signup success:', { email: formData.email });
      setSuccessMessage('Signup successful! Redirecting to onboarding...');
      // Auth state is automatically updated by AuthContext
      setTimeout(() => navigate('/onboarding'), 1000);
    } catch (error: any) {
      console.log('🔴 Signup failed:', error);
      setSuccessMessage(null);
      
      // Handle specific error cases
      let errorMessage = error.message || 'Registration failed. Please try again.';
      
      // Check if it's a duplicate email error
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exists')) {
        // Show as email field error
        setErrors({
          email: 'This email is already registered. Please login instead.',
          submit: errorMessage,
        });
      } else {
        // Show as general submit error
        setErrors({
          submit: errorMessage,
        });
      }
    }
  };

  /**
   * Password requirements checklist
   * Now special character is REQUIRED (not optional)
   */
  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(formData.password), text: 'One special character (!@#$%^&*)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 py-3 px-4 sm:px-6">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img 
            src={remsanaIcon} 
            alt="REMSANA" 
            className="w-9 h-9 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">REMSANA</h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">Business Builder</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#218D8D] to-[#2dd4bf]" />
            
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Create Your Account
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Join thousands of SME owners growing their businesses
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.phoneCountry}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phoneCountry: e.target.value }))}
                      className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#1C1C8B]/20 focus:border-[#1C1C8B]/30 transition-all"
                    >
                      <option value="+234">+234</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="801 234 5678"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData((prev) => ({ ...prev, phone: value }));
                        }}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C1C8B] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-2.5 p-3 bg-gray-50 rounded-xl space-y-1.5">
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px]">
                          {req.met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#218D8D]" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                          )}
                          <span className={req.met ? 'text-[#218D8D] font-medium' : 'text-gray-400'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div>
                  <Checkbox
                    checked={formData.termsAccepted}
                    onChange={(checked) => setFormData((prev) => ({ ...prev, termsAccepted: checked }))}
                  >
                    <span className="text-sm text-gray-500">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-[#1C1C8B] font-medium hover:underline"
                      >
                        Terms of Service
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-[#1C1C8B] font-medium hover:underline"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </Checkbox>
                  {errors.terms && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.terms}</p>
                  )}
                </div>
                {successMessage && <Alert variant="success" message={successMessage} className="mb-4" />}
                {errors.submit && <Alert variant="error" message={errors.submit} className="mb-4" />}
                
                {/* Create Account Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full !rounded-xl"
                  loading={authLoading}
                  disabled={authLoading}
                >
                  {authLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Already have account?{' '}
                  <Link to="/login" className="text-[#1C1C8B] font-semibold hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
