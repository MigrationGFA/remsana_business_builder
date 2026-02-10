import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

interface RepaymentSchedule {
  loanAmount: number;
  apr: number;
  monthlyPayment: number;
  termMonths: number;
  totalInterest: number;
  totalRepayment: number;
  schedule: Array<{
    paymentNumber: number;
    dueDate: string;
    paymentAmount: number;
    principal: number;
    interest: number;
    balanceAfter: number;
  }>;
}

export default function LoanRepaymentSchedulePage() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<RepaymentSchedule | null>(null);

  useEffect(() => {
    // Generate repayment schedule
    const offer = JSON.parse(localStorage.getItem('selected_loan_offer') || '{}');
    if (offer.loanAmount) {
      const monthlyPayment = offer.monthlyPayment || 2150;
      const termMonths = offer.termMonths || 12;
      const loanAmount = offer.loanAmount || 25000;
      const apr = offer.apr || 8.5;

      const scheduleData: RepaymentSchedule = {
        loanAmount,
        apr,
        monthlyPayment,
        termMonths,
        totalInterest: offer.totalInterest || 2800,
        totalRepayment: offer.totalRepayment || 27800,
        schedule: [],
      };

      let balance = loanAmount;
      const monthlyRate = apr / 100 / 12;

      for (let i = 1; i <= termMonths; i++) {
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;
        balance -= principal;

        scheduleData.schedule.push({
          paymentNumber: i,
          dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
          paymentAmount: monthlyPayment,
          principal: Math.round(principal),
          interest: Math.round(interest),
          balanceAfter: Math.max(0, Math.round(balance)),
        });
      }

      setSchedule(scheduleData);
    }
  }, []);

  if (!schedule) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <p className="text-[14px] text-[#6B7C7C]">Loading repayment schedule...</p>
      </div>
    );
  }

  const nextPayment = schedule.schedule[0];
  const today = new Date();
  const daysUntilNext = Math.ceil(
    (new Date(nextPayment.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
            <p className="text-[12px] text-[#6B7C7C]">Repayment Schedule</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-[600px] mx-auto space-y-6">
          {/* Overview */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-[20px] font-semibold text-[#1F2121] mb-4">
                Loan Repayment Overview
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[12px] text-[#6B7C7C] mb-1">Total Borrowed</p>
                  <p className="text-[18px] font-bold text-[#1F2121]">
                    ₦{schedule.loanAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7C7C] mb-1">Interest Rate</p>
                  <p className="text-[18px] font-bold text-[#1F2121]">{schedule.apr}% APR</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7C7C] mb-1">Monthly Payment</p>
                  <p className="text-[18px] font-bold text-[#1F2121]">
                    ₦{schedule.monthlyPayment.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7C7C] mb-1">Repayment Period</p>
                  <p className="text-[18px] font-bold text-[#1F2121]">
                    {schedule.termMonths} months
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-[#6B7C7C]/20">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#6B7C7C]">Total to Repay:</span>
                  <span className="text-[20px] font-bold text-[#1C1C8B]">
                    ₦{schedule.totalRepayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[12px] text-[#6B7C7C]">Total Interest:</span>
                  <span className="text-[14px] font-medium text-[#1F2121]">
                    ₦{schedule.totalInterest.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Payment */}
          <Card className="border-2 border-[#1C1C8B]/30 bg-[#1C1C8B]/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1C1C8B]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#1C1C8B]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-semibold text-[#1F2121] mb-1">
                    Next Payment
                  </h3>
                  <p className="text-[12px] text-[#6B7C7C]">
                    Due: {new Date(nextPayment.dueDate).toLocaleDateString()} ({daysUntilNext} days)
                  </p>
                </div>
                <Badge variant="primary" className="bg-[#1C1C8B]/10 text-[#1C1C8B]">
                  ₦{nextPayment.paymentAmount.toLocaleString()}
                </Badge>
              </div>
              <p className="text-[12px] text-[#6B7C7C]">
                This payment will be automatically debited from your bank account
              </p>
            </CardContent>
          </Card>

          {/* Full Schedule */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">
                Full Repayment Schedule
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[#6B7C7C]/20">
                      <th className="text-left py-2 text-[#6B7C7C] font-medium">Payment #</th>
                      <th className="text-left py-2 text-[#6B7C7C] font-medium">Due Date</th>
                      <th className="text-right py-2 text-[#6B7C7C] font-medium">Amount</th>
                      <th className="text-right py-2 text-[#6B7C7C] font-medium">Principal</th>
                      <th className="text-right py-2 text-[#6B7C7C] font-medium">Interest</th>
                      <th className="text-right py-2 text-[#6B7C7C] font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.schedule.map((payment) => (
                      <tr
                        key={payment.paymentNumber}
                        className="border-b border-[#6B7C7C]/10 hover:bg-[#f3f0fa]"
                      >
                        <td className="py-3 text-[#1F2121]">{payment.paymentNumber}</td>
                        <td className="py-3 text-[#1F2121]">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right font-medium text-[#1F2121]">
                          ₦{payment.paymentAmount.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-[#6B7C7C]">
                          ₦{payment.principal.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-[#6B7C7C]">
                          ₦{payment.interest.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-[#1F2121]">
                          ₦{payment.balanceAfter.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                // In production, this would initiate early payment
                alert('Early payment feature coming soon!');
              }}
              className="flex-1"
            >
              Make Early Payment
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
