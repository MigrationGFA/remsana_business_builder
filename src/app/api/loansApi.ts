/**
 * ADDON: Dynamic Data Replacement – Loans API client
 * Endpoints: /loans/eligibility, /loans/offers, /loans/apply, /loans/me
 */

import { api } from './httpClient';

export interface LoanOffer {
  offerId: string;
  lender: string;
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

export const loansApi = {
  checkEligibility: async (data: {
    nin: string;
    monthlyIncome: string;
    employmentType: string;
  }) => {
    console.log('[Loans] ➡️ POST /loans/eligibility', data);
    const res = await api.post('/loans/eligibility', data);
    console.log('[Loans] ⬅️ POST /loans/eligibility response:', res.data);
    return res.data as {
      eligible: boolean;
      maxLoanAmount: number;
      minLoanAmount: number;
      estimatedAprRange: string;
      offersCount: number;
    };
  },

  getOffers: async () => {
    console.log('[Loans] ➡️ GET /loans/offers');
    const res = await api.get('/loans/offers');
    console.log('[Loans] ⬅️ GET /loans/offers response:', res.data);
    return (res.data?.offers ?? []) as LoanOffer[];
  },

  apply: async (data: {
    offerId: string;
    nin?: string;
    monthlyIncome?: string;
    employmentType?: string;
  }) => {
    console.log('[Loans] ➡️ POST /loans/apply', data);
    const res = await api.post('/loans/apply', data);
    console.log('[Loans] ⬅️ POST /loans/apply response:', res.data);
    return res.data as { applicationId: string; status: string; message: string };
  },

  getMyApplication: async () => {
    console.log('[Loans] ➡️ GET /loans/me');
    const res = await api.get('/loans/me');
    console.log('[Loans] ⬅️ GET /loans/me response:', res.data);
    return res.data?.application as {
      applicationId: string;
      status: string;
      lender: string;
      loanAmount: number;
      apr: number;
      monthlyPayment: number;
      termMonths: number;
      events: Array<{ timestamp: string; event: string; description: string }>;
    } | null;
  },
};
