import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Loader, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, Button, Badge, LinearProgress } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

type LoanStatus = 'pending' | 'underwriting' | 'approved' | 'disbursed' | 'active';

interface LoanApplication {
  applicationId: string;
  status: LoanStatus;
  lender: string;
  loanAmount: number;
  apr: number;
  monthlyPayment: number;
  termMonths: number;
  events: Array<{
    timestamp: string;
    event: string;
    description: string;
  }>;
}

export default function LoanStatusPage() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching loan application status
    setTimeout(() => {
      const mockApplication: LoanApplication = {
        applicationId: 'app_lendsqr_456',
        status: 'underwriting',
        lender: 'Lendsqr',
        loanAmount: 25000,
        apr: 8.5,
        monthlyPayment: 2150,
        termMonths: 12,
        events: [
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            event: 'application_submitted',
            description: 'Loan application submitted to Lendsqr',
          },
          {
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            event: 'underwriting_started',
            description: 'Underwriting in progress',
          },
        ],
      };
      setApplication(mockApplication);
      setIsLoading(false);

      // Simulate status updates
      const interval = setInterval(() => {
        setApplication((prev) => {
          if (!prev) return prev;
          if (prev.status === 'underwriting') {
            return {
              ...prev,
              status: 'approved',
              events: [
                ...prev.events,
                {
                  timestamp: new Date().toISOString(),
                  event: 'loan_approved',
                  description: 'Loan approved by Lendsqr',
                },
              ],
            };
          }
          if (prev.status === 'approved') {
            return {
              ...prev,
              status: 'disbursed',
              events: [
                ...prev.events,
                {
                  timestamp: new Date().toISOString(),
                  event: 'loan_disbursed',
                  description: '₦25,000 disbursed to Remsana. Registration starting.',
                },
              ],
            };
          }
          return prev;
        });
      }, 10000); // Update every 10 seconds for demo

      return () => clearInterval(interval);
    }, 1000);
  }, []);

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
      case 'active':
        return 'bg-[#218D8D]/10 text-[#218D8D] border-[#218D8D]/30';
      case 'underwriting':
        return 'bg-[#1C1C8B]/10 text-[#1C1C8B] border-[#1C1C8B]/30';
      default:
        return 'bg-[#A84B2F]/10 text-[#A84B2F] border-[#A84B2F]/30';
    }
  };

  const getStatusLabel = (status: LoanStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'underwriting':
        return 'In Review';
      case 'approved':
        return 'Approved';
      case 'disbursed':
        return 'Disbursed';
      case 'active':
        return 'Active';
      default:
        return status;
    }
  };

  if (isLoading || !application) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#1C1C8B] animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-[#6B7C7C]">Loading loan status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
            <p className="text-[12px] text-[#6B7C7C]">Loan Status</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-[600px] mx-auto space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#1F2121] mb-1">
                    Loan Application Status
                  </h2>
                  <p className="text-[12px] text-[#6B7C7C]">
                    Application ID: {application.applicationId}
                  </p>
                </div>
                <Badge
                  variant="primary"
                  className={`${getStatusColor(application.status)}`}
                >
                  {getStatusLabel(application.status)}
                </Badge>
              </div>

              {application.status === 'underwriting' && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader className="w-5 h-5 text-[#1C1C8B] animate-spin" />
                    <span className="text-[14px] text-[#1F2121]">
                      Underwriting in progress...
                    </span>
                  </div>
                  <LinearProgress value={60} />
                  <p className="text-[12px] text-[#6B7C7C] mt-2">
                    Usually approved within 2-4 hours
                  </p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="mb-4 p-4 bg-[#218D8D]/10 rounded-[8px]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#218D8D]" />
                    <span className="text-[14px] font-semibold text-[#1F2121]">
                      Loan Approved!
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B7C7C]">
                    Preparing disbursement...
                  </p>
                </div>
              )}

              {application.status === 'disbursed' && (
                <div className="mb-4 p-4 bg-[#218D8D]/10 rounded-[8px]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#218D8D]" />
                    <span className="text-[14px] font-semibold text-[#1F2121]">
                      ₦{application.loanAmount.toLocaleString()} Disbursed
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B7C7C]">
                    Your business registration is now in progress!
                  </p>
                </div>
              )}

              <div className="space-y-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#6B7C7C]">Lender:</span>
                  <span className="font-medium text-[#1F2121]">{application.lender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C7C]">Loan Amount:</span>
                  <span className="font-medium text-[#1F2121]">
                    ₦{application.loanAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C7C]">APR:</span>
                  <span className="font-medium text-[#1F2121]">{application.apr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C7C]">Monthly Payment:</span>
                  <span className="font-medium text-[#1F2121]">
                    ₦{application.monthlyPayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C7C]">Term:</span>
                  <span className="font-medium text-[#1F2121]">
                    {application.termMonths} months
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">
                Application Timeline
              </h3>
              <div className="space-y-4">
                {application.events.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#218D8D]"></div>
                      {index < application.events.length - 1 && (
                        <div className="w-0.5 h-8 bg-[#6B7C7C]/20 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-[14px] font-medium text-[#1F2121] mb-1">
                        {event.description}
                      </p>
                      <p className="text-[12px] text-[#6B7C7C]">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {application.status === 'disbursed' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">
                  What Happens Next?
                </h3>
                <div className="space-y-3 text-[14px] text-[#6B7C7C]">
                  <p>✓ Your ₦{application.loanAmount.toLocaleString()} has been sent to Remsana</p>
                  <p>✓ Business registration is now in progress</p>
                  <p>✓ You'll receive updates via SMS and email</p>
                  <p>✓ Your first payment is due on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
            {application.status === 'disbursed' && (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/loan/repayment-schedule')}
                className="flex-1"
              >
                View Repayment Schedule
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
