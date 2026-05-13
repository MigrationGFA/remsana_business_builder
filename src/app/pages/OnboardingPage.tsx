import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Edit, X, Clock } from 'lucide-react';
import { Button, Input, Alert, Modal, ModalFooter } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getOnboardingProgress, saveOnboardingProgress, completeOnboarding, hasBackend } from '../api/onboardingApi';
import { NIGERIA_STATES, getLGAsByState } from '../utils/nigeriaLGA';

interface BusinessData {
  businessType: string;
  businessName: string;
  tradingName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  state: string;
  lga: string;
  industry: string;
  revenue: string;
  employees: string;
  goals: string[];
}

const BUSINESS_TYPES = [
  { id: 'unregistered', label: 'Unregistered Business', description: 'Trading but not yet formally registered with CAC', icon: '📝' },
  { id: 'sole', label: 'Sole Proprietorship', description: 'Single owner operation (registered business name)', icon: '👤' },
  { id: 'partnership', label: 'Partnership', description: 'Multiple owners (registered business name)', icon: '👥' },
  { id: 'limited', label: 'Limited Liability Company', description: 'Formal company structure (Ltd.)', icon: '🏢' },
  { id: 'public', label: 'Public Limited Company', description: 'Publicly traded company', icon: '📊' },
];

const INDUSTRIES = [
  'Agriculture & Agro-processing',
  'Retail & Wholesale Trade',
  'Manufacturing',
  'Services (Professional)',
  'Food & Beverage',
  'Construction & Real Estate',
  'Transportation & Logistics',
  'Technology & IT',
  'Healthcare & Pharmacy',
  'Education & Training',
  'Fashion & Textiles',
  'Tourism & Hospitality',
  'Media & Entertainment',
  'Other',
];

const REVENUE_BRACKETS = [
  { id: 'under_1m', label: 'Under ₦1 Million' },
  { id: '1m_10m', label: '₦1M - ₦10M' },
  { id: '10m_100m', label: '₦10M - ₦100M' },
  { id: '100m_500m', label: '₦100M - ₦500M' },
  { id: 'above_500m', label: 'Above ₦500M' },
];

const EMPLOYEE_RANGES = [
  { id: '1', label: '1 - Just me' },
  { id: '2-5', label: '2-5 employees' },
  { id: '6-20', label: '6-20 employees' },
  { id: '21-50', label: '21-50 employees' },
  { id: '51-100', label: '51-100 employees' },
  { id: '100+', label: '100+ employees' },
];

const BUSINESS_GOALS = [
  'Increase revenue',
  'Expand product/services',
  'Enter new markets',
  'Improve profitability',
  'Build strong team',
  'Digitalize operations',
  'Improve customer experience',
  'Other',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [formData, setFormData] = useState<BusinessData>({
    businessType: '',
    businessName: '',
    tradingName: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    state: '',
    lga: '',
    industry: '',
    revenue: '',
    employees: '',
    goals: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (hasBackend()) {
      getOnboardingProgress()
        .then((res) => {
          if (res.form_data && Object.keys(res.form_data).length > 0) {
            setFormData((prev) => ({ ...prev, ...res.form_data }));
          }
          if (res.current_step && res.current_step >= 1 && res.current_step <= 5) {
            setCurrentStep(res.current_step);
          }
          if (res.is_complete) {
            setShowCompletedModal(true);
          }
        })
        .catch(() => { /* keep defaults */ });
    } else {
      const saved = localStorage.getItem('remsana_onboarding_progress');
      if (saved) {
        try {
          const { currentStep: s, formData: f } = JSON.parse(saved);
          if (s) setCurrentStep(s);
          if (f) setFormData((prev) => ({ ...prev, ...f }));
        } catch (_) {}
      }
    }
  }, [navigate]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.businessType) {
        newErrors.businessType = 'Please select a business type';
      }
    } else if (step === 2) {
      if (!formData.businessName || formData.businessName.length < 3) {
        newErrors.businessName = 'Business name is required (min 3 characters)';
      }
      if (!formData.businessPhone || formData.businessPhone.replace(/\D/g, '').length < 10) {
        newErrors.businessPhone = 'Valid phone number is required';
      }
      if (!formData.businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
        newErrors.businessEmail = 'Valid email is required';
      }
      if (!formData.businessAddress || formData.businessAddress.length < 5) {
        newErrors.businessAddress = 'Business address is required';
      }
      if (!formData.state) {
        newErrors.state = 'State is required';
      }
      if (!formData.lga) {
        newErrors.lga = 'Local Government Area is required';
      }
    } else if (step === 3) {
      if (!formData.industry) {
        newErrors.industry = 'Please select an industry';
      }
      if (!formData.revenue) {
        newErrors.revenue = 'Please select revenue bracket';
      }
    } else if (step === 4) {
      if (!formData.employees) {
        newErrors.employees = 'Please select employee range';
      }
      if (formData.goals.length === 0) {
        newErrors.goals = 'Please select at least one business goal';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        // Auto-save progress before moving to next step
        await saveProgress();
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      // Auto-save progress before going back
      await saveProgress();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setIsSubmitting(true);
    try {
      if (hasBackend()) {
        await completeOnboarding({ form_data: formData });
      } else {
        localStorage.removeItem('remsana_onboarding_progress');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.error || err?.message || 'Failed to complete' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProgress = async () => {
    if (hasBackend()) {
      try {
        await saveOnboardingProgress({ current_step: currentStep, form_data: formData });
      } catch (_) { /* ignore save errors */ }
    } else {
      localStorage.setItem('remsana_onboarding_progress', JSON.stringify({
        currentStep,
        formData,
        savedAt: new Date().toISOString(),
      }));
    }
  };

  const handleExit = async () => {
    await saveProgress();
    setShowExitModal(true);
  };

  const handleConfirmExit = async () => {
    await saveProgress();
    setShowExitModal(false);
    navigate('/dashboard');
  };

  const handleSkip = async () => {
    await saveProgress();
    setShowSkipModal(true);
  };

  const handleConfirmSkip = async () => {
    await saveProgress();
    setShowSkipModal(false);
    navigate('/dashboard');
  };

  const updateField = (field: keyof BusinessData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Step 1: Business Type
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        What type of business do you operate?
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Select the structure that best describes your business
      </p>

      <div className="space-y-2.5">
        {BUSINESS_TYPES.map((type) => (
          <label
            key={type.id}
            className={`
              flex items-start gap-3.5 p-4 border-2 rounded-2xl cursor-pointer transition-all
              ${formData.businessType === type.id
                ? 'border-[#1C1C8B] bg-[#1C1C8B]/5 shadow-sm'
                : 'border-gray-100 hover:border-[#1C1C8B]/30 hover:bg-gray-50/50'
              }
            `}
          >
            <input
              type="radio"
              name="businessType"
              value={type.id}
              checked={formData.businessType === type.id}
              onChange={(e) => updateField('businessType', e.target.value)}
              className="sr-only"
            />
            <div className="text-2xl mt-0.5">{type.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">{type.label}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{type.description}</div>
            </div>
            {formData.businessType === type.id && (
              <Check className="w-5 h-5 text-[#1C1C8B] flex-shrink-0 mt-0.5" />
            )}
          </label>
        ))}
      </div>
      {errors.businessType && (
        <p className="text-[11px] text-red-500 mt-2">{errors.businessType}</p>
      )}
    </div>
  );

  // Step 2: Business Basics
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        Tell us about your business
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Provide your business contact and location information
      </p>

      <div className="space-y-4">
        <div>
          <Input
            label="Business Name *"
            placeholder="Enter your registered business name"
            value={formData.businessName}
            onChange={(e) => updateField('businessName', e.target.value)}
            error={errors.businessName}
            maxLength={100}
          />
        </div>

        <div>
          <Input
            label="Trading Name (if different)"
            placeholder="How is your business known as?"
            value={formData.tradingName}
            onChange={(e) => updateField('tradingName', e.target.value)}
            helperText="Leave blank if same as business name"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Business Phone *
          </label>
          <div className="flex gap-2">
            <select
              value="+234"
              onChange={() => {}}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#1C1C8B]/20 focus:border-[#1C1C8B]/30 transition-all"
            >
              <option value="+234">+234</option>
            </select>
            <Input
              type="tel"
              placeholder="801 234 5678"
              value={formData.businessPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                updateField('businessPhone', value);
              }}
              error={errors.businessPhone}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Input
            label="Business Email *"
            type="email"
            placeholder="business@example.com"
            value={formData.businessEmail}
            onChange={(e) => updateField('businessEmail', e.target.value)}
            error={errors.businessEmail}
            helperText="We'll send updates here"
          />
        </div>

        <div>
          <Input
            label="Business Address *"
            placeholder="Street address of business location"
            value={formData.businessAddress}
            onChange={(e) => updateField('businessAddress', e.target.value)}
            error={errors.businessAddress}
            helperText="Physical location in Nigeria"
            maxLength={150}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            State *
          </label>
          <select
            value={formData.state}
            onChange={(e) => {
              const newState = e.target.value;
              updateField('state', newState);
              // Reset LGA when state changes
              if (formData.lga) {
                updateField('lga', '');
              }
            }}
            className="w-full h-[44px] px-3 rounded-xl border border-gray-200 focus:border-[#1C1C8B]/30 focus:ring-2 focus:ring-[#1C1C8B]/20 outline-none bg-white text-sm transition-all"
          >
            <option value="">Select State</option>
            {NIGERIA_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-[11px] text-red-500 mt-1">{errors.state}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Local Government Area (LGA) *
          </label>
          <select
            value={formData.lga}
            onChange={(e) => updateField('lga', e.target.value)}
            disabled={!formData.state}
            className="w-full h-[44px] px-3 rounded-xl border border-gray-200 focus:border-[#1C1C8B]/30 focus:ring-2 focus:ring-[#1C1C8B]/20 outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all"
          >
            <option value="">
              {formData.state ? 'Select LGA' : 'Select a state first'}
            </option>
            {formData.state && getLGAsByState(formData.state).map((lga) => (
              <option key={lga.value} value={lga.value}>
                {lga.name}
              </option>
            ))}
          </select>
          {errors.lga && (
            <p className="text-[11px] text-red-500 mt-1">{errors.lga}</p>
          )}
          {!formData.state && (
            <p className="text-[11px] text-gray-400 mt-1">
              Please select a state to see available LGAs
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 3: Business Category & Industry
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        What industry is your business in?
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Help us understand your business sector
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Primary Industry *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => updateField('industry', e.target.value)}
            className="w-full h-[44px] px-3 rounded-xl border border-gray-200 focus:border-[#1C1C8B]/30 focus:ring-2 focus:ring-[#1C1C8B]/20 outline-none bg-white text-sm transition-all"
          >
            <option value="">Select Industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="text-[11px] text-red-500 mt-1">{errors.industry}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-3">
            What is your annual revenue estimate? (NGN) *
          </label>
          <div className="space-y-2">
            {REVENUE_BRACKETS.map((bracket) => (
              <label
                key={bracket.id}
                className={`
                  flex items-center gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all
                  ${formData.revenue === bracket.id
                    ? 'border-[#1C1C8B] bg-[#1C1C8B]/5 shadow-sm'
                    : 'border-gray-100 hover:border-[#1C1C8B]/30 hover:bg-gray-50/50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="revenue"
                  value={bracket.id}
                  checked={formData.revenue === bracket.id}
                  onChange={(e) => updateField('revenue', e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${formData.revenue === bracket.id ? 'border-[#1C1C8B]' : 'border-gray-300'}
                  `}
                >
                  {formData.revenue === bracket.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C8B]" />
                  )}
                </div>
                <span className="text-sm text-gray-900">{bracket.label}</span>
              </label>
            ))}
          </div>
          {errors.revenue && (
            <p className="text-[11px] text-red-500 mt-2">{errors.revenue}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 4: Employees & Objectives
  const renderStep4 = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        How many employees do you have?
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        (including yourself)
      </p>

      <div className="space-y-6">
        <div>
          <div className="space-y-2 mb-4">
            {EMPLOYEE_RANGES.map((range) => (
              <label
                key={range.id}
                className={`
                  flex items-center gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all
                  ${formData.employees === range.id
                    ? 'border-[#1C1C8B] bg-[#1C1C8B]/5 shadow-sm'
                    : 'border-gray-100 hover:border-[#1C1C8B]/30 hover:bg-gray-50/50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="employees"
                  value={range.id}
                  checked={formData.employees === range.id}
                  onChange={(e) => updateField('employees', e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${formData.employees === range.id ? 'border-[#1C1C8B]' : 'border-gray-300'}
                  `}
                >
                  {formData.employees === range.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C8B]" />
                  )}
                </div>
                <span className="text-sm text-gray-900">{range.label}</span>
              </label>
            ))}
          </div>
          {errors.employees && (
            <p className="text-[11px] text-red-500">{errors.employees}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-3">
            What are your business goals for the next 12 months? (Select all that apply) *
          </label>
          <div className="space-y-2">
            {BUSINESS_GOALS.map((goal) => (
              <label
                key={goal}
                className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-2xl hover:bg-gray-50/50 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={(e) => {
                    const newGoals = e.target.checked
                      ? [...formData.goals, goal]
                      : formData.goals.filter((g) => g !== goal);
                    updateField('goals', newGoals);
                  }}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]/30"
                />
                <span className="text-sm text-gray-900">{goal}</span>
              </label>
            ))}
          </div>
          {errors.goals && (
            <p className="text-[11px] text-red-500 mt-2">{errors.goals}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 5: Review & Confirm
  const renderStep5 = () => {
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Review Your Information
        </h2>
        <Alert
          variant="warning"
          message="Please review before submitting"
          className="mb-6"
        />

        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#1C1C8B] to-[#667eea]" />
            <div className="p-4 sm:p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Business Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Business Type:</span>
                  <span className="text-gray-900 font-medium">
                    {BUSINESS_TYPES.find((t) => t.id === formData.businessType)?.label}
                    <button onClick={() => setCurrentStep(1)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Business Name:</span>
                  <span className="text-gray-900 font-medium">
                    {formData.businessName}
                    <button onClick={() => setCurrentStep(2)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-gray-900 font-medium">
                    {formData.businessPhone}
                    <button onClick={() => setCurrentStep(2)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-gray-900 font-medium">
                    {formData.businessEmail}
                    <button onClick={() => setCurrentStep(2)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-gray-900 font-medium">
                    {formData.businessAddress}
                    <button onClick={() => setCurrentStep(2)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">LGA:</span>
                  <span className="text-gray-900 font-medium">
                    {formData.lga}
                    <button onClick={() => setCurrentStep(2)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#218D8D] to-[#2dd4bf]" />
            <div className="p-4 sm:p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Business Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Industry:</span>
                  <span className="text-gray-900 font-medium">
                    {formData.industry}
                    <button onClick={() => setCurrentStep(3)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Employees:</span>
                  <span className="text-gray-900 font-medium">
                    {EMPLOYEE_RANGES.find((r) => r.id === formData.employees)?.label}
                    <button onClick={() => setCurrentStep(4)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Revenue:</span>
                  <span className="text-gray-900 font-medium">
                    {REVENUE_BRACKETS.find((r) => r.id === formData.revenue)?.label}
                    <button onClick={() => setCurrentStep(3)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Goals:</span>
                  <span className="text-gray-900 font-medium text-right">
                    {formData.goals.join(', ')}
                    <button onClick={() => setCurrentStep(4)} className="ml-2 text-[#1C1C8B] hover:underline"><Edit className="w-3.5 h-3.5 inline" /></button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-gray-300 text-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]/30 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              All information is accurate and I authorize Remsana to use this data for business registration
            </span>
          </label>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!confirmed || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit & Complete Setup'}
        </Button>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-30 py-3 px-4 sm:px-6">
        <div className="max-w-[720px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={remsanaIcon} 
              alt="REMSANA" 
              className="w-9 h-9 object-contain"
            />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">REMSANA</h1>
              <p className="text-[11px] text-gray-400 -mt-0.5">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all flex items-center gap-1.5"
              title="Skip for now"
            >
              <Clock className="w-3.5 h-3.5" />
              Skip
            </button>
            <button
              onClick={handleExit}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="Exit"
              aria-label="Exit onboarding"
            >
              <X className="w-4.5 h-4.5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-50">
        <div className="max-w-[720px] mx-auto px-4 py-2.5">
          {/* Step indicators */}
          <div className="flex items-center gap-1.5 mb-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex-1 flex items-center gap-1.5">
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  step < currentStep ? 'bg-[#1C1C8B]' :
                  step === currentStep ? 'bg-gradient-to-r from-[#1C1C8B] to-[#667eea]' :
                  'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-[720px] mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 p-5 sm:p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div className="flex gap-3 mt-8">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex-1 !rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  className="flex-1 !rounded-xl"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Profile Setup?"
        size="sm"
      >
        <div className="py-4">
          <p className="text-sm text-gray-700 mb-6">
            Your progress has been saved. You can continue this setup later from your dashboard.
          </p>
          <div className="mb-6 p-3.5 bg-gray-50 rounded-xl">
            <p className="text-[11px] text-gray-400 mb-1">Progress saved:</p>
            <p className="text-sm font-semibold text-gray-900">
              Step {currentStep} of {totalSteps} ({Math.round(progress)}%)
            </p>
          </div>
          <ModalFooter>
            <Button variant="secondary" size="md" onClick={() => setShowExitModal(false)}>
              Continue Setup
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmExit}>
              Exit to Dashboard
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Skip Confirmation Modal */}
      <Modal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        title="Skip Profile Setup?"
        size="sm"
      >
        <div className="py-4">
          <p className="text-sm text-gray-700 mb-6">
            You can complete your business profile later. Your progress will be saved so you can continue where you left off.
          </p>
          <Alert
            variant="info"
            message="Completing your profile helps us personalize your experience and provide better recommendations."
            className="mb-6"
          />
          <ModalFooter>
            <Button variant="secondary" size="md" onClick={() => setShowSkipModal(false)}>
              Continue Setup
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmSkip}>
              <Clock className="w-4 h-4 mr-2" />
              Skip for Now
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Onboarding Already Completed Modal */}
      <Modal
        isOpen={showCompletedModal}
        onClose={() => {
          setShowCompletedModal(false);
          navigate('/dashboard');
        }}
        title="Onboarding Complete"
        size="sm"
      >
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#218D8D]/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-[#218D8D]" />
            </div>
            <p className="text-sm text-gray-700">
              You've already completed your business profile setup. No further action is needed.
            </p>
          </div>
          <ModalFooter>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setShowCompletedModal(false);
                navigate('/dashboard');
              }}
            >
              Back to Dashboard
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
