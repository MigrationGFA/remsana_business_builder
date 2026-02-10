import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, TrendingDown } from 'lucide-react';
import { Card, CardContent, Button, Badge, Alert } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

interface LoanOffer {
  offerId: string;
  lender: string;
  lenderLogo?: string;
  loanAmount: number;
  apr: number;
  monthlyPayment: number;
  termMonths: number;
  totalInterest: number;
  totalRepayment: number;
  processingTime: string;
  approvalCertainty: number;
  badge?: string;
}

const MOCK_OFFERS: LoanOffer[] = [
  {
    offerId: 'off_lendsqr_001',
    lender: 'Lendsqr',
    loanAmount: 25000,
    apr: 8.5,
    monthlyPayment: 2150,
    termMonths: 12,
    totalInterest: 2800,
    totalRepayment: 27800,
    processingTime: '2-4 hours',
    approvalCertainty: 0.92,
    badge: 'Best Rate',
  },
  {
    offerId: 'off_flutterwave_001',
    lender: 'Flutterwave Lending',
    loanAmount: 25000,
    apr: 12.0,
    monthlyPayment: 2200,
    termMonths: 12,
    totalInterest: 3600,
    totalRepayment: 28400,
    processingTime: 'Same-day',
    approvalCertainty: 0.88,
    badge: 'Fastest Approval',
  },
];

export default function LoanOffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to get offers
    setTimeout(() => {
      setOffers(MOCK_OFFERS);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleSelectOffer = (offerId: string) => {
    setSelectedOffer(offerId);
    const offer = offers.find((o) => o.offerId === offerId);
    if (offer) {
      localStorage.setItem('selected_loan_offer', JSON.stringify(offer));
      navigate('/loan/agreement');
    }
  };

  const getApprovalColor = (certainty: number) => {
    if (certainty >= 0.9) return 'text-[#218D8D]';
    if (certainty >= 0.85) return 'text-[#1C1C8B]';
    return 'text-[#A84B2F]';
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
            <p className="text-[12px] text-[#6B7C7C]">Choose Your Loan Offer</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-[600px] mx-auto">
          <Card className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-[24px] font-semibold text-[#1F2121] mb-2">
                Choose Your Loan Offer
              </h2>
              <p className="text-[14px] text-[#6B7C7C]">
                Offers are valid for 1 hour. Best offers shown first.
              </p>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-[#1C1C8B] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[14px] text-[#6B7C7C]">
                  Fetching loan offers from lenders...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {offers.map((offer) => (
                    <Card
                      key={offer.offerId}
                      variant={selectedOffer === offer.offerId ? 'clickable' : 'hoverable'}
                      className={`cursor-pointer transition-all ${
                        selectedOffer === offer.offerId
                          ? 'border-2 border-[#1C1C8B] bg-[#1C1C8B]/5'
                          : ''
                      }`}
                      onClick={() => handleSelectOffer(offer.offerId)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-[18px] font-semibold text-[#1F2121]">
                                {offer.lender}
                              </h3>
                              {offer.badge && (
                                <Badge variant="primary" className="text-[10px]">
                                  {offer.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[12px] text-[#6B7C7C]">
                              Loan Amount: ₦{offer.loanAmount.toLocaleString()}
                            </p>
                          </div>
                          {selectedOffer === offer.offerId && (
                            <CheckCircle2 className="w-6 h-6 text-[#218D8D]" />
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-[12px] text-[#6B7C7C] mb-1">APR</p>
                            <p className="text-[20px] font-bold text-[#1C1C8B]">
                              {offer.apr}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[12px] text-[#6B7C7C] mb-1">Monthly Payment</p>
                            <p className="text-[20px] font-bold text-[#1F2121]">
                              ₦{offer.monthlyPayment.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-[12px] text-[#6B7C7C] mb-4">
                          <div className="flex justify-between">
                            <span>Term:</span>
                            <span className="font-medium text-[#1F2121]">
                              {offer.termMonths} months
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Interest:</span>
                            <span className="font-medium text-[#1F2121]">
                              ₦{offer.totalInterest.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total to Repay:</span>
                            <span className="font-medium text-[#1F2121]">
                              ₦{offer.totalRepayment.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Processing Time:</span>
                            <span className="font-medium text-[#1F2121] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {offer.processingTime}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Approval Certainty:</span>
                            <span className={`font-medium ${getApprovalColor(offer.approvalCertainty)}`}>
                              {Math.round(offer.approvalCertainty * 100)}% Likely
                            </span>
                          </div>
                        </div>

                        <Button
                          variant={selectedOffer === offer.offerId ? 'primary' : 'secondary'}
                          size="md"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOffer(offer.offerId);
                          }}
                        >
                          {selectedOffer === offer.offerId ? 'Selected' : 'Select This Offer'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert
                  variant="info"
                  message="By selecting an offer, you agree to the lender's terms & privacy policy"
                  className="mb-6"
                />

                <div className="flex gap-4">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate('/loan/eligibility')}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  {selectedOffer && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleSelectOffer(selectedOffer)}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
