import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, File, X, CheckCircle2, CreditCard, Building2, Smartphone, Lock, CreditCard as CardIcon, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, Button, Input, Alert, LinearProgress, Modal, ModalFooter } from '../components/remsana';
import { ToastContainer, useToast } from '../components/remsana/Toast';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

interface Document {
  id: string;
  type: string;
  required: boolean;
  file: File | null;
  uploadProgress: number;
  uploaded: boolean;
}

const DOCUMENT_TYPES: Document[] = [
  { id: 'national-id', type: 'National ID Photocopy', required: true, file: null, uploadProgress: 0, uploaded: false },
  { id: 'proof-of-address', type: 'Proof of Address (Utility Bill, Bank Statement, Lease)', required: true, file: null, uploadProgress: 0, uploaded: false },
  { id: 'business-plan', type: 'Business Plan or Description Document', required: true, file: null, uploadProgress: 0, uploaded: false },
  { id: 'bank-statement', type: 'Bank Statement (Optional)', required: false, file: null, uploadProgress: 0, uploaded: false },
  { id: 'passport-photo', type: 'Passport Photograph', required: true, file: null, uploadProgress: 0, uploaded: false },
];

const PAYMENT_METHODS = [
  { id: 'paystack', name: 'Paystack', description: 'Card, Bank Transfer, USSD', icon: CreditCard },
  { id: 'flutterwave', name: 'Flutterwave', description: 'Card, Bank Transfer, USSD, Wallet', icon: Smartphone },
  { id: 'bank-transfer', name: 'Direct Bank Transfer', description: 'Manual transfer with verification', icon: Building2 },
  { id: 'loan', name: 'Get a Loan', description: 'Borrow ₦25,000. Repay monthly. Instant approval.', icon: TrendingUp },
];

type RegistrationType = 'business_name' | 'company_incorporation' | '';

export default function BusinessRegistrationPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('');
  const [documents, setDocuments] = useState<Document[]>(DOCUMENT_TYPES);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; type: string; file: File | null } | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  // Type-specific form data (demo-level; backend schema follows separate spec)
  const [proposedBusinessName, setProposedBusinessName] = useState('');
  const [proposedBusinessNameAlt, setProposedBusinessNameAlt] = useState('');
  const [businessObject1, setBusinessObject1] = useState('');
  const [businessObject2, setBusinessObject2] = useState('');
  const [businessObject3, setBusinessObject3] = useState('');
  const [proposedCompanyName, setProposedCompanyName] = useState('');
  const [proposedCompanyNameAlt, setProposedCompanyNameAlt] = useState('');
  const [companyObjectsText, setCompanyObjectsText] = useState('');
  const [authorizedShareCapital, setAuthorizedShareCapital] = useState('');
  const registrationFee = 25000;

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleFileSelect = (docId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be less than 5MB');
      setShowErrorModal(true);
      return;
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return { ...doc, file, uploadProgress: 0, uploaded: false };
        }
        return doc;
      })
    );

    simulateUpload(docId);
  };

  const simulateUpload = (docId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === docId) {
            if (progress >= 100) {
              clearInterval(interval);
              return { ...doc, uploadProgress: 100, uploaded: true };
            }
            return { ...doc, uploadProgress: progress };
          }
          return doc;
        })
      );
    }, 200);
  };

  const handleRemoveFile = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return { ...doc, file: null, uploadProgress: 0, uploaded: false };
        }
        return doc;
      })
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!registrationType) {
        setErrorMessage('Please select a registration type to continue');
        setShowErrorModal(true);
        return;
      }
      const requiredDocs = documents.filter((d) => d.required);
      const allRequiredUploaded = requiredDocs.every((d) => d.uploaded);
      if (!allRequiredUploaded) {
        setErrorMessage('Please upload all required documents before proceeding');
        setShowErrorModal(true);
        return;
      }
    }
    if (currentStep === 2) {
      // Validate type-specific core info before moving on
      if (registrationType === 'business_name') {
        if (!proposedBusinessName || proposedBusinessName.trim().length < 2) {
          setErrorMessage('Please enter a valid proposed business name (at least 2 characters).');
          setShowErrorModal(true);
          return;
        }
        if (!proposedBusinessNameAlt || proposedBusinessNameAlt.trim().length < 2) {
          setErrorMessage('Please enter a second business name option (at least 2 characters).');
          setShowErrorModal(true);
          return;
        }
        if (!businessObject1) {
          setErrorMessage('Please select at least one business object/activity.');
          setShowErrorModal(true);
          return;
        }
      } else if (registrationType === 'company_incorporation') {
        if (!proposedCompanyName || proposedCompanyName.trim().length < 2) {
          setErrorMessage('Please enter a valid proposed company name (at least 2 characters).');
          setShowErrorModal(true);
          return;
        }
        if (!proposedCompanyNameAlt || proposedCompanyNameAlt.trim().length < 2) {
          setErrorMessage('Please enter a second company name option (at least 2 characters).');
          setShowErrorModal(true);
          return;
        }
        if (!companyObjectsText || companyObjectsText.trim().length < 50) {
          setErrorMessage('Please describe the company objects (at least 2 sentences / ~50+ characters).');
          setShowErrorModal(true);
          return;
        }
        const capitalNumber = Number(authorizedShareCapital.replace(/,/g, ''));
        if (Number.isNaN(capitalNumber) || capitalNumber < 1000) {
          setErrorMessage('Please enter an authorized share capital of at least ₦1,000.');
          setShowErrorModal(true);
          return;
        }
      }
    }
    if (currentStep === 3) {
      // On payment step, trigger payment handler instead of moving to next step
      if (!paymentMethod) {
        setErrorMessage('Please select a payment method');
        setShowErrorModal(true);
        return;
      }
      handlePayment(paymentMethod);
      return; // Don't advance step here, let handlePayment handle navigation
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If on step 1, navigate back to dashboard
      navigate('/dashboard');
    }
  };

  const saveProgress = () => {
    localStorage.setItem('remsana_business_registration_progress', JSON.stringify({
      currentStep,
      registrationType,
      documents: documents.map(d => ({ id: d.id, uploaded: d.uploaded })),
      paymentMethod,
      paymentCompleted,
      savedAt: new Date().toISOString(),
    }));
  };

  const handleExit = () => {
    saveProgress();
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    saveProgress();
    setShowExitModal(false);
    navigate('/dashboard');
  };

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const handleConfirmSkip = () => {
    saveProgress();
    setShowSkipModal(false);
    navigate('/dashboard');
  };

  const handlePayment = async (method: string) => {
    // Don't navigate immediately - let user see the selection and click button
    if (method === 'loan') {
      // Navigate to loan eligibility check
      navigate('/loan/eligibility');
    } else if (method === 'bank-transfer') {
      // Show bank details on next step
      setCurrentStep(4);
    } else {
      // Show in-app payment modal for Paystack/Flutterwave
      setShowPaymentModal(true);
    }
  };

  const handleProcessPayment = () => {
    setIsSubmitting(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      setShowPaymentModal(false);
      const ref = `TXN-${Date.now()}`;
      setTransactionRef(ref);
      setPaymentCompleted(true);
      setShowPaymentSuccessModal(true);
    }, 2000);
  };

  const handlePaymentSuccessClose = () => {
    setShowPaymentSuccessModal(false);
    setCurrentStep(4);
  };

  const handleConfirmBankTransfer = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPaymentCompleted(true);
      toast.success('Bank transfer confirmed! Our team will verify within 2-4 hours.');
      setCurrentStep(5);
    }, 1000);
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy. Please try again.');
    });
  };

  const handlePreviewFile = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc && doc.file) {
      setPreviewFile({
        name: doc.file.name,
        type: doc.type,
        file: doc.file,
      });
      setShowFilePreviewModal(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 2000);
  };

  // Step 1: Registration Type & Document Upload
  const renderStep1 = () => (
    <div>
      <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
        Choose Registration Type
      </h2>
      <p className="text-[14px] text-[#6B7C7C] mb-6">
        Select the CAC registration pathway and upload the required documents
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card
          variant="clickable"
          className={`cursor-pointer transition-all ${
            registrationType === 'business_name'
              ? 'border-2 border-[#1C1C8B] bg-[#1C1C8B]/5 shadow-md'
              : 'border border-[#6B7C7C]/20 hover:border-[#1C1C8B]/40'
          }`}
          onClick={() => setRegistrationType('business_name')}
        >
          <CardContent className="p-4">
            <h3 className="text-[16px] font-semibold text-[#1F2121] mb-1">
              Business Name Registration
            </h3>
            <p className="text-[12px] text-[#6B7C7C]">
              Sole proprietor or partnership. Simpler, faster and lower cost. Ideal for small businesses.
            </p>
          </CardContent>
        </Card>
        <Card
          variant="clickable"
          className={`cursor-pointer transition-all ${
            registrationType === 'company_incorporation'
              ? 'border-2 border-[#1C1C8B] bg-[#1C1C8B]/5 shadow-md'
              : 'border border-[#6B7C7C]/20 hover:border-[#1C1C8B]/40'
          }`}
          onClick={() => setRegistrationType('company_incorporation')}
        >
          <CardContent className="p-4">
            <h3 className="text-[16px] font-semibold text-[#1F2121] mb-1">
              Company Incorporation (Ltd.)
            </h3>
            <p className="text-[12px] text-[#6B7C7C]">
              Limited liability company with formal governance. Suitable for scaling, investors and larger operations.
            </p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-[18px] font-semibold text-[#1F2121] mb-2">
        Upload Required Documents
      </h3>
      <p className="text-[12px] text-[#6B7C7C] mb-4">
        For this demo, the same core document set is used for both Business Name Registration and Company Incorporation.
      </p>

      <div className="space-y-6">
        {documents.map((doc) => (
          <div key={doc.id} className="border-b border-[#6B7C7C]/20 pb-6 last:border-0 last:pb-0">
            <div className="flex items-start gap-2 mb-3">
              <input
                type="checkbox"
                checked={doc.required}
                disabled
                className="w-5 h-5 rounded-[4px] border-2 border-[#6B7C7C]/40 text-[#1C1C8B] mt-0.5"
              />
              <div className="flex-1">
                <label className="text-[14px] font-medium text-[#1F2121]">
                  {doc.type}
                </label>
                {doc.required && (
                  <p className="text-[12px] text-[#C01F2F] mt-1">⚠ Required</p>
                )}
                {!doc.required && (
                  <p className="text-[12px] text-[#6B7C7C] mt-1">ℹ Optional</p>
                )}
              </div>
            </div>

            {!doc.file ? (
              <div className="border-2 border-dashed border-[#6B7C7C]/30 rounded-[8px] p-6 text-center">
                <Upload className="w-8 h-8 text-[#6B7C7C] mx-auto mb-2" />
                <p className="text-[14px] text-[#1F2121] mb-1">📄 Upload File</p>
                <p className="text-[12px] text-[#6B7C7C] mb-4">PDF, JPG, PNG (Max 5MB)</p>
                <label className="inline-block cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(doc.id, file);
                    }}
                    className="hidden"
                  />
                  <span className="inline-flex items-center justify-center gap-2 h-[32px] px-3 text-[12px] rounded-[8px] font-medium bg-white text-[#1C1C8B] border-2 border-[#1C1C8B] hover:bg-[#f3f0fa] transition-all duration-200">
                    Browse Files
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {doc.uploadProgress < 100 ? (
                  <div className="p-4 bg-[#f3f0fa] rounded-[8px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="animate-spin w-4 h-4 border-2 border-[#1C1C8B] border-t-transparent rounded-full"></div>
                      <span className="text-[14px] text-[#1F2121]">
                        Uploading: {doc.type}
                      </span>
                    </div>
                    <LinearProgress value={doc.uploadProgress} />
                  </div>
                ) : (
                  <div className="p-4 bg-[#218D8D]/10 border border-[#218D8D]/30 rounded-[8px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#218D8D]" />
                        <div>
                          <p className="text-[14px] font-medium text-[#1F2121]">
                            ✅ {doc.file.name}
                          </p>
                          <p className="text-[12px] text-[#6B7C7C]">
                            {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handlePreviewFile(doc.id)}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRemoveFile(doc.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Step 2: Type-specific core information
  const renderStep2 = () => (
    <div>
      {registrationType === 'business_name' && (
        <>
          <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
            Business Name Registration Details
          </h2>
          <p className="text-[14px] text-[#6B7C7C] mb-6">
            Provide the core information required to register your business name with CAC.
          </p>
          <Alert
            variant="info"
            message={'Suggest an uncommon name, and use 2-3 words to make it unique. You can add "Ventures" or "Enterprises" for Business Name Registration, and "Limited" for Incorporation.'}
            className="mb-6"
          />

          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                Proposed Business Name (Option 1) *
              </label>
              <Input
                type="text"
                placeholder="e.g. Remsana Foods & Trading"
                value={proposedBusinessName}
                onChange={(e) => setProposedBusinessName(e.target.value)}
                maxLength={100}
              />
              <p className="text-[11px] text-[#6B7C7C] mt-1">
                2–100 characters. No special characters except spaces, hyphens and apostrophes.
              </p>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                Proposed Business Name (Option 2) *
              </label>
              <Input
                type="text"
                placeholder="e.g. Remsana Ventures"
                value={proposedBusinessNameAlt}
                onChange={(e) => setProposedBusinessNameAlt(e.target.value)}
                maxLength={100}
              />
              <p className="text-[11px] text-[#6B7C7C] mt-1">
                Provide a second option in case the first is unavailable at CAC.
              </p>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                Business Objects (Activities) *
              </label>
              <select
                value={businessObject1}
                onChange={(e) => setBusinessObject1(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[4px] border border-[#6B7C7C]/30 focus:border-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]/20 outline-none bg-white text-[14px]"
              >
                <option value="">Select primary business object</option>
                <option value="Trading in Agricultural Products">Trading in Agricultural Products</option>
                <option value="Retail Clothing">Retail Clothing</option>
                <option value="Consulting Services">Consulting Services</option>
                <option value="Food & Beverage Services">Food & Beverage Services</option>
                <option value="Technology & IT Services">Technology & IT Services</option>
              </select>
              <p className="text-[11px] text-[#6B7C7C] mt-1">
                Primary object must be selected. Additional objects are optional (maximum 3).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1F2121] mb-1">
                  Additional Object (optional)
                </label>
                <select
                  value={businessObject2}
                  onChange={(e) => setBusinessObject2(e.target.value)}
                  className="w-full h-[40px] px-3 rounded-[4px] border border-[#6B7C7C]/30 focus:border-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]/20 outline-none bg-white text-[14px]"
                >
                  <option value="">Select secondary object</option>
                  <option value="Retail Clothing">Retail Clothing</option>
                  <option value="Consulting Services">Consulting Services</option>
                  <option value="Logistics & Delivery">Logistics & Delivery</option>
                  <option value="E-commerce Services">E-commerce Services</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1F2121] mb-1">
                  Additional Object (optional)
                </label>
                <select
                  value={businessObject3}
                  onChange={(e) => setBusinessObject3(e.target.value)}
                  className="w-full h-[40px] px-3 rounded-[4px] border border-[#6B7C7C]/30 focus:border-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]/20 outline-none bg-white text-[14px]"
                >
                  <option value="">Select tertiary object</option>
                  <option value="Consulting Services">Consulting Services</option>
                  <option value="Food & Beverage Services">Food & Beverage Services</option>
                  <option value="Training & Education">Training & Education</option>
                  <option value="Repair & Maintenance">Repair & Maintenance</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {registrationType === 'company_incorporation' && (
        <>
          <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
            Company Incorporation Details
          </h2>
          <p className="text-[14px] text-[#6B7C7C] mb-6">
            Provide the core information required to incorporate your limited liability company (Ltd.).
          </p>
          <Alert
            variant="info"
            message={'Suggest an uncommon name, and use 2-3 words to make it unique. You can add "Ventures" or "Enterprises" for Business Name Registration, and "Limited" for Incorporation.'}
            className="mb-6"
          />

          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                Proposed Company Name (Option 1) *
              </label>
              <Input
                type="text"
                placeholder="e.g. Remsana Business Services Ltd."
                value={proposedCompanyName}
                onChange={(e) => setProposedCompanyName(e.target.value)}
                maxLength={100}
              />
              <p className="text-[11px] text-[#6B7C7C] mt-1">
                Include &quot;Limited&quot; or &quot;Ltd.&quot; at the end. No special characters beyond spaces and hyphens.
              </p>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                Proposed Company Name (Option 2) *
              </label>
              <Input
                type="text"
                placeholder="e.g. Remsana Technology Limited"
                value={proposedCompanyNameAlt}
                onChange={(e) => setProposedCompanyNameAlt(e.target.value)}
                maxLength={100}
              />
              <p className="text-[11px] text-[#6B7C7C] mt-1">
                Provide a second option in case the first is unavailable at CAC.
              </p>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                Company Objects (Business Purpose) *
              </label>
              <textarea
                value={companyObjectsText}
                onChange={(e) => setCompanyObjectsText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-[4px] border border-[#6B7C7C]/30 focus:border-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]/20 outline-none text-[14px] resize-none"
                placeholder="Describe what the company will do in 2–3 sentences..."
              />
              <p className="text-[11px] text-[#6B7C7C] mt-1">
                100–500 characters. CAC must approve the described objects.
              </p>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">
                Authorized Share Capital (₦) *
              </label>
              <Input
                type="text"
                placeholder="100000"
                value={authorizedShareCapital}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d]/g, '');
                  setAuthorizedShareCapital(cleaned);
                }}
              />
              <p className="text-[11px] text-[#6B7C7C] mt-1">
                Minimum ₦1,000. Typical range: ₦100,000 – ₦10,000,000.
              </p>
            </div>
          </div>
        </>
      )}

      {!registrationType && (
        <Alert
          variant="warning"
          message="Please go back and select a registration type to continue."
          className="mt-4"
        />
      )}
    </div>
  );

  // Step 3: Payment Method Selection
  const renderStep3 = () => (
    <div>
      <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
        Select Payment Method
      </h2>
      <p className="text-[14px] text-[#6B7C7C] mb-6">
        Choose your preferred payment method (₦{registrationFee.toLocaleString()})
      </p>

      <div className="space-y-4 mb-6">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = paymentMethod === method.id;
          return (
            <Card
              key={method.id}
              variant="clickable"
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'border-2 border-[#1C1C8B] bg-[#1C1C8B]/5 shadow-md' 
                  : 'border-2 border-transparent hover:border-[#1C1C8B]/30'
              }`}
              onClick={() => {
                setPaymentMethod(method.id);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#1C1C8B] scale-110' : 'bg-[#f3f0fa]'
                  }`}>
                    <Icon className={`w-6 h-6 transition-colors ${
                      isSelected ? 'text-white' : 'text-[#1C1C8B]'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[16px] font-semibold text-[#1F2121]">
                        {method.name}
                      </h3>
                      {method.id === 'loan' && (
                        <span className="px-2 py-0.5 bg-[#218D8D]/10 text-[#218D8D] text-[10px] font-medium rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#6B7C7C]">
                      {method.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-[#218D8D] animate-in zoom-in-95" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Payment Method Info */}
      {paymentMethod && (
        <Card className="mb-6 border-[#1C1C8B]/30 bg-[#1C1C8B]/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#218D8D] mt-0.5" />
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#1F2121] mb-1">
                  {paymentMethod === 'loan' 
                    ? 'Loan Application Selected'
                    : paymentMethod === 'bank-transfer'
                    ? 'Bank Transfer Selected'
                    : `${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name} Selected`
                  }
                </p>
                <p className="text-[12px] text-[#6B7C7C]">
                  {paymentMethod === 'loan'
                    ? 'Click the button below to check your loan eligibility and view offers'
                    : paymentMethod === 'bank-transfer'
                    ? 'Click the button below to see bank transfer details'
                    : 'Click the button below to proceed with payment'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Step 4: Payment Processing / Bank Transfer Details
  const renderStep4 = () => {
    if (paymentMethod === 'bank-transfer') {
      return (
        <div>
          <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
            Bank Transfer Details
          </h2>
          <p className="text-[14px] text-[#6B7C7C] mb-6">
            Transfer ₦{registrationFee.toLocaleString()} to the account below
          </p>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] text-[#6B7C7C] mb-1 block">Bank Name</label>
                  <div className="flex items-center justify-between p-3 bg-[#f3f0fa] rounded-[8px]">
                    <span className="text-[16px] font-semibold text-[#1F2121]">Access Bank</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyToClipboard('Access Bank', 'Bank name')}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7C7C] mb-1 block">Account Number</label>
                  <div className="flex items-center justify-between p-3 bg-[#f3f0fa] rounded-[8px]">
                    <span className="text-[16px] font-semibold text-[#1F2121]">1234567890</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyToClipboard('1234567890', 'Account number')}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7C7C] mb-1 block">Account Name</label>
                  <div className="flex items-center justify-between p-3 bg-[#f3f0fa] rounded-[8px]">
                    <span className="text-[16px] font-semibold text-[#1F2121]">Remsana Business Services Ltd</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyToClipboard('Remsana Business Services Ltd', 'Account name')}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7C7C] mb-1 block">Amount</label>
                  <div className="p-3 bg-[#1C1C8B]/10 rounded-[8px]">
                    <span className="text-[20px] font-bold text-[#1C1C8B]">₦{registrationFee.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7C7C] mb-1 block">Payment Reference</label>
                  <div className="flex items-center justify-between p-3 bg-[#f3f0fa] rounded-[8px]">
                    <span className="text-[14px] font-medium text-[#1F2121]">REMS-{Date.now().toString().slice(-8)}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const ref = `REMS-${Date.now().toString().slice(-8)}`;
                        handleCopyToClipboard(ref, 'Payment reference');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert
            variant="warning"
            message="Please include the payment reference in your transfer. Our team will verify within 2-4 hours."
            className="mb-6"
          />

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleConfirmBankTransfer}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Confirming...' : "I've Made the Transfer"}
          </Button>
        </div>
      );
    }

    // Payment gateway processing
    return (
      <div>
        <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
          Processing Payment...
        </h2>
        <p className="text-[14px] text-[#6B7C7C] mb-6">
          Please wait while we process your payment
        </p>

        {paymentCompleted ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-[#218D8D] mx-auto mb-4" />
              <h3 className="text-[20px] font-semibold text-[#1F2121] mb-2">
                Payment Successful!
              </h3>
              <p className="text-[14px] text-[#6B7C7C] mb-4">
                Transaction Reference: TXN-{Date.now()}
              </p>
              <p className="text-[14px] text-[#1F2121] mb-6">
                Amount Paid: ₦{registrationFee.toLocaleString()}
              </p>
              <p className="text-[12px] text-[#6B7C7C] mb-4">
                Receipt has been sent to your email. Our team will begin verification within 2-3 business days.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#1C1C8B] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[14px] text-[#6B7C7C]">
                Redirecting to payment gateway...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Step 5: Confirmation & Next Steps
  const renderStep5 = () => (
    <div>
      <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
        Registration Submitted!
      </h2>
      <p className="text-[14px] text-[#6B7C7C] mb-6">
        Your business registration is being processed
      </p>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#218D8D]" />
              <div>
                <h4 className="text-[14px] font-semibold text-[#1F2121]">Payment Verified</h4>
                <p className="text-[12px] text-[#6B7C7C]">✓ Payment received and confirmed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[#1C1C8B] flex items-center justify-center">
                <div className="w-2 h-2 bg-[#1C1C8B] rounded-full"></div>
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#1F2121]">Verification In Progress</h4>
                <p className="text-[12px] text-[#6B7C7C]">Our team is reviewing your documents (2-3 business days)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full border-2 border-[#6B7C7C]/40 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#6B7C7C]/40 rounded-full"></div>
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#1F2121]">Submitted to CAC</h4>
                <p className="text-[12px] text-[#6B7C7C]">Application sent to Corporate Affairs Commission</p>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full border-2 border-[#6B7C7C]/40"></div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#1F2121]">Certificate Ready</h4>
                <p className="text-[12px] text-[#6B7C7C]">Download your Business Name Certificate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">
            Expected Timeline
          </h3>
          <div className="space-y-2 text-[14px] text-[#6B7C7C]">
            <p>• Document verification: 2-3 business days</p>
            <p>• CAC submission: Within 5 business days</p>
            <p>• CAC processing: 10-21 business days</p>
            <p className="font-semibold text-[#1F2121] mt-2">
              Total: Maximum one month (20-25 business days)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">
            What Happens Next?
          </h3>
          <div className="space-y-3 text-[14px] text-[#6B7C7C]">
            <p>✓ You'll receive email notifications at each milestone</p>
            <p>✓ Track progress on your dashboard</p>
            <p>✓ Our support team is available if you have questions</p>
            <p>✓ Download your certificate once approved</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
        >
          Go to Dashboard
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={() => navigate('/learning')}
        >
          Explore Free Learning Programme
        </Button>
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <img src={remsanaIcon} alt="REMSANA" className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-[14px] sm:text-[18px] font-semibold text-[#1F2121] truncate">REMSANA</h1>
              <p className="text-[10px] sm:text-[12px] text-[#6B7C7C] truncate">Business Registration - Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-[12px] sm:text-[14px] text-[#6B7C7C] hover:text-[#1C1C8B] hover:bg-[#f3f0fa] rounded-[6px] transition-colors"
              title="Skip for now"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Skip</span>
            </button>
            <button
              onClick={handleExit}
              className="p-1.5 hover:bg-[#f3f0fa] rounded-[6px] transition-colors"
              title="Exit"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B7C7C] hover:text-[#1C1C8B]" />
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-[#6B7C7C]/20">
        <div className="max-w-[600px] mx-auto px-4 py-2">
          <div className="h-2 bg-[#f3f0fa] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-[600px] mx-auto">
          <Card className="p-6 md:p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            {currentStep < 5 && currentStep !== 4 && (
              <div className="flex gap-4 mt-8">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                {currentStep === 3 ? (
                  // On payment step, show payment-specific button
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNext}
                    className="flex-1"
                    disabled={!paymentMethod}
                  >
                    {paymentMethod === 'loan' 
                      ? 'Get a Loan Instead' 
                      : paymentMethod === 'bank-transfer'
                      ? 'Continue to Bank Transfer'
                      : paymentMethod
                      ? `Pay ₦${registrationFee.toLocaleString()}`
                      : 'Select Payment Method'
                    }
                    {paymentMethod !== 'loan' && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNext}
                    className="flex-1"
                    disabled={currentStep === 2 && !documents.filter((d) => d.required).every((d) => d.uploaded)}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
            {currentStep === 4 && paymentMethod === 'bank-transfer' && !paymentCompleted && (
              <div className="mt-8">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleBack}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Payment Methods
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        size="sm"
      >
        <div className="py-4">
          <p className="text-[14px] text-[#1F2121] mb-6">{errorMessage}</p>
          <ModalFooter>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowErrorModal(false)}
            >
              OK
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Payment Modal (Paystack/Flutterwave) */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowPaymentModal(false);
          }
        }}
        title={`Complete Payment - ${paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}`}
        size="md"
        showCloseButton={!isSubmitting}
      >
        <div className="py-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 p-4 bg-[#f3f0fa] rounded-[8px]">
              <span className="text-[14px] text-[#6B7C7C]">Amount to Pay:</span>
              <span className="text-[24px] font-bold text-[#1C1C8B]">₦{registrationFee.toLocaleString()}</span>
            </div>
          </div>

          {!isSubmitting ? (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[12px] text-[#6B7C7C] mb-2 block">Card Number</label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] text-[#6B7C7C] mb-2 block">Expiry Date</label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#6B7C7C] mb-2 block">CVV</label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      maxLength={4}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7C7C] mb-2 block">Cardholder Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  />
                </div>
              </div>

              <Alert
                variant="info"
                message="This is a demo payment. In production, this would connect to Paystack/Flutterwave API."
                className="mb-6"
              />

              <ModalFooter>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleProcessPayment}
                  disabled={!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name}
                >
                  Pay ₦{registrationFee.toLocaleString()}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#1C1C8B] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[14px] text-[#6B7C7C]">
                Processing payment...
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Payment Success Modal */}
      <Modal
        isOpen={showPaymentSuccessModal}
        onClose={handlePaymentSuccessClose}
        title="Payment Successful!"
        size="sm"
      >
        <div className="py-4">
          <div className="text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-[#218D8D] mx-auto mb-4" />
            <p className="text-[16px] font-semibold text-[#1F2121] mb-2">
              Payment completed successfully
            </p>
            <p className="text-[14px] text-[#6B7C7C] mb-4">
              Transaction Reference: <span className="font-mono font-semibold">{transactionRef}</span>
            </p>
            <p className="text-[14px] text-[#6B7C7C]">
              Amount Paid: <span className="font-semibold text-[#1C1C8B]">₦{registrationFee.toLocaleString()}</span>
            </p>
          </div>
          <Alert
            variant="info"
            message="Receipt has been sent to your email. Our team will begin verification within 2-3 business days."
            className="mb-6"
          />
          <ModalFooter>
            <Button
              variant="primary"
              size="md"
              onClick={handlePaymentSuccessClose}
              className="w-full"
            >
              Continue
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* File Preview Modal */}
      <Modal
        isOpen={showFilePreviewModal}
        onClose={() => setShowFilePreviewModal(false)}
        title={`Preview: ${previewFile?.name || 'Document'}`}
        size="lg"
      >
        <div className="py-4">
          {previewFile && previewFile.file && (
            <div>
              <div className="mb-4 p-3 bg-[#f3f0fa] rounded-[8px]">
                <p className="text-[12px] text-[#6B7C7C] mb-1">Document Type:</p>
                <p className="text-[14px] font-medium text-[#1F2121]">{previewFile.type}</p>
                <p className="text-[12px] text-[#6B7C7C] mt-2 mb-1">File Name:</p>
                <p className="text-[14px] font-medium text-[#1F2121]">{previewFile.name}</p>
                <p className="text-[12px] text-[#6B7C7C] mt-2 mb-1">File Size:</p>
                <p className="text-[14px] font-medium text-[#1F2121]">
                  {(previewFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <div className="border border-[#6B7C7C]/20 rounded-[8px] p-4 bg-[#f3f0fa] min-h-[400px] flex items-center justify-center">
                {previewFile.file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(previewFile.file)}
                    alt={previewFile.name}
                    className="max-w-full max-h-[500px] rounded-[8px]"
                  />
                ) : previewFile.file.type === 'application/pdf' ? (
                  <div className="text-center">
                    <File className="w-16 h-16 text-[#6B7C7C] mx-auto mb-4" />
                    <p className="text-[14px] text-[#1F2121] mb-2">PDF Document</p>
                    <p className="text-[12px] text-[#6B7C7C] mb-4">
                      PDF preview is not available in this demo. The file will be reviewed by our team.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const url = URL.createObjectURL(previewFile.file!);
                        window.open(url, '_blank');
                      }}
                    >
                      Open in New Tab
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <File className="w-16 h-16 text-[#6B7C7C] mx-auto mb-4" />
                    <p className="text-[14px] text-[#1F2121] mb-2">{previewFile.name}</p>
                    <p className="text-[12px] text-[#6B7C7C]">
                      Preview not available for this file type. The file will be reviewed by our team.
                    </p>
                  </div>
                )}
              </div>
              
              <ModalFooter>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowFilePreviewModal(false)}
                >
                  Close
                </Button>
                {previewFile.file.type === 'application/pdf' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      const url = URL.createObjectURL(previewFile.file!);
                      window.open(url, '_blank');
                    }}
                  >
                    Open PDF
                  </Button>
                )}
              </ModalFooter>
            </div>
          )}
        </div>
      </Modal>

      {/* Exit Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Business Registration?"
        size="sm"
      >
        <div className="py-4">
          <p className="text-[14px] text-[#1F2121] mb-4">
            Your progress has been saved. You can continue your business registration later from your dashboard.
          </p>
          <ModalFooter>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowExitModal(false)}
              className="flex-1"
            >
              Continue Setup
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmExit}
              className="flex-1"
            >
              Exit to Dashboard
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Skip Modal */}
      <Modal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        title="Skip Business Registration?"
        size="sm"
      >
        <div className="py-4">
          <p className="text-[14px] text-[#1F2121] mb-4">
            Your progress has been saved. You can complete your business registration later from your dashboard.
          </p>
          <ModalFooter>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowSkipModal(false)}
              className="flex-1"
            >
              Continue Setup
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
