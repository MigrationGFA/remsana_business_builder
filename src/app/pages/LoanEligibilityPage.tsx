import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Loader } from 'lucide-react';
import { Card, CardContent, Button, Input, Alert, LinearProgress } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

const INCOME_RANGES = [
  { id: '50k', label: 'Under ₦50,000', value: 50000 },
  { id: '50-100k', label: '₦50,000 - ₦100,000', value: 75000 },
  { id: '100-250k', label: '₦100,000 - ₦250,000', value: 175000 },
  { id: '250-500k', label: '₦250,000 - ₦500,000', value: 375000 },
  { id: '500k+', label: '₦500,000+', value: 750000 },
];

const EMPLOYMENT_TYPES = [
  { id: 'self_employed', label: 'Self-employed' },
  { id: 'employed', label: 'Employed' },
  { id: 'business_owner', label: 'Business Owner' },
];

export default function LoanEligibilityPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nin: '',
    monthlyIncome: '',
    employmentType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [eligibilityData, setEligibilityData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.nin || formData.nin.length !== 11) {
      newErrors.nin = 'Please enter a valid 11-digit NIN';
    }
    if (!formData.monthlyIncome) {
      newErrors.monthlyIncome = 'Please select your monthly income range';
    }
    if (!formData.employmentType) {
      newErrors.employmentType = 'Please select your employment type';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsChecking(true);

    // Simulate API call
    setTimeout(() => {
      setIsChecking(false);
      // Mock eligibility check - in production, this would call the API
      const eligible = formData.monthlyIncome !== '50k'; // Reject if income too low
      setIsEligible(eligible);
      
      if (eligible) {
        setEligibilityData({
          maxLoanAmount: 50000,
          minLoanAmount: 10000,
          estimatedAprRange: '8-15%',
        });
      }
    }, 2000);
  };

  const handleContinueToOffers = () => {
    // Store eligibility data
    localStorage.setItem('loan_eligibility', JSON.stringify({
      ...formData,
      eligible: true,
      ...eligibilityData,
    }));
    navigate('/loan/offers');
  };

  const handleBackToPayment = () => {
    navigate('/business-registration');
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
            <p className="text-[12px] text-[#6B7C7C]">Loan Eligibility Check</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-[600px] mx-auto">
          <Card className="p-6 md:p-8">
            {isEligible === null && !isChecking && (
              <>
                <div className="mb-6">
                  <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
                    Let's Check Your Loan Eligibility
                  </h2>
                  <p className="text-[14px] text-[#6B7C7C]">
                    Takes 30 seconds. No credit check yet.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* NIN Input */}
                  <div>
                    <Input
                      label="National ID Number (NIN) *"
                      placeholder="Enter your 11-digit NIN"
                      value={formData.nin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setFormData({ ...formData, nin: value });
                        if (errors.nin) setErrors({ ...errors, nin: '' });
                      }}
                      error={errors.nin}
                      maxLength={11}
                    />
                    <p className="text-[12px] text-[#6B7C7C] mt-1">
                      Your NIN is required for loan verification
                    </p>
                  </div>

                  {/* Monthly Income */}
                  <div>
                    <label className="text-[14px] font-medium text-[#1F2121] mb-2 block">
                      Monthly Income *
                    </label>
                    <div className="space-y-2">
                      {INCOME_RANGES.map((range) => (
                        <label
                          key={range.id}
                          className={`
                            flex items-center gap-3 p-3 border-2 rounded-[8px] cursor-pointer transition-all
                            ${formData.monthlyIncome === range.id
                              ? 'border-[#1C1C8B] bg-[#1C1C8B]/5'
                              : 'border-[#6B7C7C]/30 hover:border-[#1C1C8B]/50'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="monthlyIncome"
                            value={range.id}
                            checked={formData.monthlyIncome === range.id}
                            onChange={(e) => {
                              setFormData({ ...formData, monthlyIncome: e.target.value });
                              if (errors.monthlyIncome) setErrors({ ...errors, monthlyIncome: '' });
                            }}
                            className="w-5 h-5 text-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]"
                          />
                          <span className="text-[14px] text-[#1F2121]">{range.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.monthlyIncome && (
                      <p className="text-[12px] text-[#C01F2F] mt-1">{errors.monthlyIncome}</p>
                    )}
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="text-[14px] font-medium text-[#1F2121] mb-2 block">
                      Employment Type *
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {EMPLOYMENT_TYPES.map((type) => (
                        <label
                          key={type.id}
                          className={`
                            flex items-center gap-3 p-3 border-2 rounded-[8px] cursor-pointer transition-all
                            ${formData.employmentType === type.id
                              ? 'border-[#1C1C8B] bg-[#1C1C8B]/5'
                              : 'border-[#6B7C7C]/30 hover:border-[#1C1C8B]/50'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="employmentType"
                            value={type.id}
                            checked={formData.employmentType === type.id}
                            onChange={(e) => {
                              setFormData({ ...formData, employmentType: e.target.value });
                              if (errors.employmentType) setErrors({ ...errors, employmentType: '' });
                            }}
                            className="w-5 h-5 text-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]"
                          />
                          <span className="text-[14px] text-[#1F2121]">{type.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.employmentType && (
                      <p className="text-[12px] text-[#C01F2F] mt-1">{errors.employmentType}</p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleBackToPayment}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      Check Eligibility
                    </Button>
                  </div>
                </form>
              </>
            )}

            {isChecking && (
              <div className="py-12 text-center">
                <Loader className="w-12 h-12 text-[#1C1C8B] animate-spin mx-auto mb-4" />
                <p className="text-[16px] font-semibold text-[#1F2121] mb-2">
                  Checking Your Eligibility...
                </p>
                <p className="text-[14px] text-[#6B7C7C]">
                  This usually takes 30 seconds
                </p>
              </div>
            )}

            {isEligible === true && (
              <div className="py-8">
                <div className="text-center mb-6">
                  <CheckCircle2 className="w-16 h-16 text-[#218D8D] mx-auto mb-4" />
                  <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
                    Great! You're Pre-Qualified
                  </h2>
                  <p className="text-[14px] text-[#6B7C7C] mb-6">
                    You're eligible for up to ₦{eligibilityData?.maxLoanAmount.toLocaleString() || '50,000'}
                  </p>
                </div>

                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="space-y-3 text-[14px]">
                      <div className="flex justify-between">
                        <span className="text-[#6B7C7C]">Maximum Loan Amount:</span>
                        <span className="font-semibold text-[#1F2121]">
                          ₦{eligibilityData?.maxLoanAmount.toLocaleString() || '50,000'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B7C7C]">Estimated APR Range:</span>
                        <span className="font-semibold text-[#1F2121]">
                          {eligibilityData?.estimatedAprRange || '8-15%'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert
                  variant="info"
                  message="Checking available offers from our lenders..."
                  className="mb-6"
                />

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleContinueToOffers}
                >
                  View Loan Offers
                </Button>
              </div>
            )}

            {isEligible === false && (
              <div className="py-8">
                <div className="text-center mb-6">
                  <XCircle className="w-16 h-16 text-[#C01F2F] mx-auto mb-4" />
                  <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
                    Not Currently Eligible
                  </h2>
                  <p className="text-[14px] text-[#6B7C7C] mb-6">
                    Sorry, you don't currently qualify for a loan. You may reapply in 30 days.
                  </p>
                </div>

                <Alert
                  variant="warning"
                  message="You can still register your business by paying directly via Paystack, Flutterwave, or bank transfer."
                  className="mb-6"
                />

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleBackToPayment}
                  >
                    Continue with Direct Payment
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
