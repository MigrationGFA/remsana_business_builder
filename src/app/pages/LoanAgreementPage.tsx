import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, PenTool } from 'lucide-react';
import { Card, CardContent, Button, Checkbox, Alert, Modal, ModalFooter } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

interface LoanOffer {
  offerId: string;
  lender: string;
  loanAmount: number;
  apr: number;
  monthlyPayment: number;
  termMonths: number;
  totalInterest: number;
  totalRepayment: number;
}

export default function LoanAgreementPage() {
  const navigate = useNavigate();
  const [offer, setOffer] = useState<LoanOffer | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);
  const [consents, setConsents] = useState({
    agreeToTerms: false,
    authorizeDebit: false,
    readPrivacy: false,
    understandInterest: false,
  });
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedOffer = localStorage.getItem('selected_loan_offer');
    if (savedOffer) {
      setOffer(JSON.parse(savedOffer));
    } else {
      navigate('/loan/offers');
    }
  }, [navigate]);

  const handleSignature = () => {
    setIsSigning(true);
    // Simulate signature capture
    setTimeout(() => {
      setSignature('signed');
      setIsSigning(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!signature || !Object.values(consents).every((v) => v)) {
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.setItem('loan_agreement_signed', 'true');
      navigate('/loan/debit-setup');
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
            <p className="text-[12px] text-[#6B7C7C]">Loan Agreement</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-[600px] mx-auto">
          <Card className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
                Loan Details & Agreement
              </h2>
              <p className="text-[14px] text-[#6B7C7C]">
                Review your loan details and sign the agreement
              </p>
            </div>

            {/* Loan Confirmation */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#1C1C8B]/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#1C1C8B]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1F2121]">
                      You've Selected: {offer.lender}
                    </h3>
                    <p className="text-[12px] text-[#6B7C7C]">Loan Agreement</p>
                  </div>
                </div>

                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-[#6B7C7C]">Loan Amount:</span>
                    <span className="font-semibold text-[#1F2121]">
                      ₦{offer.loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7C7C]">Monthly Payment:</span>
                    <span className="font-semibold text-[#1F2121]">
                      ₦{offer.monthlyPayment.toLocaleString()} × {offer.termMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7C7C]">Total Interest:</span>
                    <span className="font-semibold text-[#1F2121]">
                      ₦{offer.totalInterest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7C7C]">Total to Repay:</span>
                    <span className="font-semibold text-[#1C1C8B] text-[16px]">
                      ₦{offer.totalRepayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7C7C]">APR:</span>
                    <span className="font-semibold text-[#1F2121]">{offer.apr}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Agreement Preview */}
            <div className="mb-6">
              <button
                onClick={() => setShowAgreementModal(true)}
                className="w-full p-4 border-2 border-dashed border-[#6B7C7C]/30 rounded-[8px] hover:border-[#1C1C8B] transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#6B7C7C]" />
                    <span className="text-[14px] font-medium text-[#1F2121]">
                      View Full Loan Agreement
                    </span>
                  </div>
                  <span className="text-[12px] text-[#6B7C7C]">Click to view</span>
                </div>
              </button>
            </div>

            {/* E-Signature */}
            <div className="mb-6">
              <label className="text-[14px] font-medium text-[#1F2121] mb-2 block">
                E-Signature *
              </label>
              <div className="border-2 border-[#6B7C7C]/30 rounded-[8px] p-6 bg-white">
                {!signature ? (
                  <div className="text-center">
                    <PenTool className="w-12 h-12 text-[#6B7C7C] mx-auto mb-3" />
                    <p className="text-[14px] text-[#6B7C7C] mb-4">
                      Please sign below to continue
                    </p>
                    <div className="border-2 border-dashed border-[#6B7C7C]/30 rounded-[8px] h-32 mb-4 flex items-center justify-center">
                      <p className="text-[12px] text-[#6B7C7C]">
                        Signature Pad (Click to sign)
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleSignature}
                      loading={isSigning}
                    >
                      {isSigning ? 'Signing...' : 'Sign Agreement'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <CheckCircle2 className="w-12 h-12 text-[#218D8D] mx-auto mb-3" />
                    <p className="text-[14px] font-medium text-[#1F2121]">
                      Agreement Signed ✓
                    </p>
                    <p className="text-[12px] text-[#6B7C7C] mt-1">
                      Signed on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Acknowledgments */}
            <div className="space-y-3 mb-6">
              <Checkbox
                checked={consents.agreeToTerms}
                onChange={(checked) =>
                  setConsents({ ...consents, agreeToTerms: checked })
                }
                label="I agree to the loan terms and conditions"
              />
              <Checkbox
                checked={consents.authorizeDebit}
                onChange={(checked) =>
                  setConsents({ ...consents, authorizeDebit: checked })
                }
                label="I authorize automatic debit from my bank account"
              />
              <Checkbox
                checked={consents.readPrivacy}
                onChange={(checked) =>
                  setConsents({ ...consents, readPrivacy: checked })
                }
                label="I've read and understand the privacy policy"
              />
              <Checkbox
                checked={consents.understandInterest}
                onChange={(checked) =>
                  setConsents({ ...consents, understandInterest: checked })
                }
                label="I understand the interest rate and fees"
              />
            </div>

            <Alert
              variant="warning"
              message="This signature is legally binding. Please review all terms before signing."
              className="mb-6"
            />

            <div className="flex gap-4">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/loan/offers')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={
                  !signature ||
                  !Object.values(consents).every((v) => v) ||
                  isSubmitting
                }
                loading={isSubmitting}
                className="flex-1"
              >
                Accept & Continue
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Loan Agreement Modal */}
      <Modal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        title="Loan Agreement - Terms & Conditions"
        size="lg"
      >
        <div className="py-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-4 text-[14px] text-[#1F2121]">
            <div>
              <h3 className="font-semibold text-[16px] mb-2">1. Loan Details</h3>
              <p className="text-[#6B7C7C]">
                You are borrowing ₦{offer?.loanAmount.toLocaleString()} at an Annual Percentage Rate (APR) of {offer?.apr}%.
                The loan will be repaid in {offer?.termMonths} monthly installments of ₦{offer?.monthlyPayment.toLocaleString()} each.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">2. Repayment Terms</h3>
              <p className="text-[#6B7C7C]">
                Monthly payments will be automatically debited from your designated bank account on the 25th of each month.
                You may make early payments without penalty. Late payments may incur additional fees.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">3. Interest & Fees</h3>
              <p className="text-[#6B7C7C]">
                Total interest over the loan term: ₦{offer?.totalInterest.toLocaleString()}.
                Total amount to repay: ₦{offer?.totalRepayment.toLocaleString()}.
                No prepayment penalties apply.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">4. Default & Consequences</h3>
              <p className="text-[#6B7C7C]">
                Failure to make payments on time may result in late fees, negative credit reporting, and potential legal action.
                Contact us immediately if you anticipate payment difficulties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">5. Right to Cancel</h3>
              <p className="text-[#6B7C7C]">
                You have the right to cancel this loan agreement within 3 days of disbursement without penalty.
                Contact support@remsana.com to cancel.
              </p>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowAgreementModal(false)}
              className="w-full"
            >
              I Understand
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
