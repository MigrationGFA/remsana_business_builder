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
      
      // Success! Redirect to onboarding
      // Auth state is automatically updated by AuthContext
      navigate('/onboarding');
    } catch (error: any) {
      // Show user-friendly error message
      setErrors({
        submit: error.message || 'Registration failed. Please try again.',
      });
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
              Create Your Account
            </h2>
            <p className="text-[14px] text-[#6B7C7C] mb-6">
              Join thousands of SME owners growing their businesses
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
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
                  <p className="text-[12px] text-[#C01F2F] mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
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
                  <p className="text-[12px] text-[#C01F2F] mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.phoneCountry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phoneCountry: e.target.value }))}
                    className="px-3 py-2 border border-[#6B7C7C]/30 rounded-[8px] text-[14px] bg-white"
                  >
                    <option value="+234">+234</option>
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
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
                  <p className="text-[12px] text-[#C01F2F] mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C7C]" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C7C] hover:text-[#1C1C8B]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[12px]">
                        {req.met ? (
                          <CheckCircle2 className="w-4 h-4 text-[#218D8D]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-[#6B7C7C]/40" />
                        )}
                        <span className={req.met ? 'text-[#218D8D]' : 'text-[#6B7C7C]'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {errors.password && (
                  <p className="text-[12px] text-[#C01F2F] mt-1">{errors.password}</p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div>
                <Checkbox
                  checked={formData.termsAccepted}
                  onChange={(checked) => setFormData((prev) => ({ ...prev, termsAccepted: checked }))}
                >
                  <span className="text-[14px]">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[#1C1C8B] hover:underline"
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-[#1C1C8B] hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </Checkbox>
                {errors.terms && (
                  <p className="text-[12px] text-[#C01F2F] mt-1">{errors.terms}</p>
                )}
              </div>
              {errors.submit && <Alert variant="error" message={errors.submit} className="mb-4" />}
              
              {/* Create Account Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={authLoading}
                disabled={authLoading}
              >
                {authLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-[14px] text-[#6B7C7C]">
                Already have account?{' '}
                <Link to="/login" className="text-[#1C1C8B] font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
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
