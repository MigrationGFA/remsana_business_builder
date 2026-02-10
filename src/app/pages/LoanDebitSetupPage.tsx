import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Building2, CreditCard } from 'lucide-react';
import { Card, CardContent, Button, Input, Alert } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

const BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

interface LoanOffer {
  monthlyPayment: number;
  lender: string;
}

export default function LoanDebitSetupPage() {
  const navigate = useNavigate();
  const [offer, setOffer] = useState<LoanOffer | null>(null);
  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    accountHolderName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const savedOffer = localStorage.getItem('selected_loan_offer');
    if (savedOffer) {
      const parsed = JSON.parse(savedOffer);
      setOffer(parsed);
      // Pre-fill account holder name from user profile
      const user = localStorage.getItem('remsana_user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          setFormData((prev) => ({
            ...prev,
            accountHolderName: userData.fullName || userData.name || '',
          }));
        } catch (e) {
          // Ignore
        }
      }
    } else {
      navigate('/loan/agreement');
    }
  }, [navigate]);

  const handleVerifyAccount = async () => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!formData.bankCode) {
      newErrors.bankCode = 'Please select your bank';
    }
    if (!formData.accountNumber || formData.accountNumber.length < 10) {
      newErrors.accountNumber = 'Please enter a valid account number';
    }
    if (!formData.accountHolderName || formData.accountHolderName.length < 3) {
      newErrors.accountHolderName = 'Please enter account holder name';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsVerifying(true);
    // Simulate account verification
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setOtpSent(true);
      // In production, this would send OTP via SMS
    }, 2000);
  };

  const handleConfirmDebit = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit OTP' });
      return;
    }

    setIsSubmitting(true);
    // Simulate debit mandate confirmation
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.setItem('loan_debit_setup', 'true');
      navigate('/loan/status');
    }, 2000);
  };

  if (!offer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
            <p className="text-[12px] text-[#6B7C7C]">Set Up Automatic Repayment</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-[600px] mx-auto">
          <Card className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
                Set Up Automatic Repayment
              </h2>
              <p className="text-[14px] text-[#6B7C7C]">
                Your monthly loan payments of ₦{offer.monthlyPayment.toLocaleString()} will be automatically deducted from this account on the 25th of each month.
              </p>
            </div>

            {!isVerified ? (
              <>
                {/* Bank Selection */}
                <div className="mb-4">
                  <label className="text-[14px] font-medium text-[#1F2121] mb-2 block">
                    Select Your Bank *
                  </label>
                  <select
                    value={formData.bankCode}
                    onChange={(e) => {
                      setFormData({ ...formData, bankCode: e.target.value });
                      if (errors.bankCode) setErrors({ ...errors, bankCode: '' });
                    }}
                    className={`
                      w-full px-4 py-3 rounded-[8px] border-2 text-[14px]
                      ${errors.bankCode
                        ? 'border-[#C01F2F] focus:border-[#C01F2F]'
                        : 'border-[#6B7C7C]/30 focus:border-[#1C1C8B]'
                      }
                      focus:outline-none focus:ring-2 focus:ring-[#1C1C8B]/20
                    `}
                  >
                    <option value="">Select Bank</option>
                    {BANKS.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.bankCode && (
                    <p className="text-[12px] text-[#C01F2F] mt-1">{errors.bankCode}</p>
                  )}
                </div>

                {/* Account Number */}
                <div className="mb-4">
                  <Input
                    label="Account Number *"
                    placeholder="Enter your 10-digit account number"
                    value={formData.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, accountNumber: value });
                      if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' });
                    }}
                    error={errors.accountNumber}
                    maxLength={10}
                  />
                </div>

                {/* Account Holder Name */}
                <div className="mb-6">
                  <Input
                    label="Account Holder Name *"
                    placeholder="Name as it appears on the account"
                    value={formData.accountHolderName}
                    onChange={(e) => {
                      setFormData({ ...formData, accountHolderName: e.target.value });
                      if (errors.accountHolderName) setErrors({ ...errors, accountHolderName: '' });
                    }}
                    error={errors.accountHolderName}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mb-4"
                  onClick={handleVerifyAccount}
                  loading={isVerifying}
                >
                  {isVerifying ? 'Verifying Account...' : 'Verify Account'}
                </Button>
              </>
            ) : (
              <>
                {/* Verified Account Display */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#218D8D]" />
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#1F2121]">
                          Account Verified ✓
                        </h3>
                        <p className="text-[12px] text-[#6B7C7C]">
                          {BANKS.find((b) => b.code === formData.bankCode)?.name} ••••{formData.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* OTP Confirmation */}
                {otpSent && (
                  <div className="mb-6">
                    <Alert
                      variant="info"
                      message={`We've sent a 6-digit confirmation code to your phone number ending in ••••${formData.accountNumber.slice(-4)}. Please enter it below.`}
                      className="mb-4"
                    />
                    <div>
                      <Input
                        label="Enter Confirmation Code (OTP) *"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                          if (errors.otp) setErrors({ ...errors, otp: '' });
                        }}
                        error={errors.otp}
                        maxLength={6}
                      />
                      <p className="text-[12px] text-[#6B7C7C] mt-1">
                        Didn't receive code? <button className="text-[#1C1C8B] hover:underline">Resend</button>
                      </p>
                    </div>
                  </div>
                )}

                {/* Debit Authorization */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-5 h-5 rounded-[4px] border-2 border-[#6B7C7C]/40 text-[#1C1C8B] mt-0.5"
                      />
                      <div>
                        <p className="text-[14px] font-medium text-[#1F2121]">
                          I authorize ₦{offer.monthlyPayment.toLocaleString()} monthly debit
                        </p>
                        <p className="text-[12px] text-[#6B7C7C] mt-1">
                          Debit starts after loan approval. You'll receive SMS notifications before each debit.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate('/loan/agreement')}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleConfirmDebit}
                    disabled={!otp || otp.length !== 6 || isSubmitting}
                    loading={isSubmitting}
                    className="flex-1"
                  >
                    Confirm & Continue
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
