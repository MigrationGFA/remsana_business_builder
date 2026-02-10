# How to Access the Loan Integration Feature

## Quick Guide

The loan integration feature has been fully implemented and is accessible through the Business Registration flow.

## Step-by-Step Access

### 1. Navigate to Business Registration

**Option A: From Dashboard**
- Login to your account
- Click on "Business Registration" or navigate to `/business-registration`

**Option B: Direct URL**
- Go to: `http://localhost:5173/business-registration`

### 2. Complete Registration Steps

1. **Step 1: Upload Documents**
   - Upload required documents (National ID, Proof of Address, Business Plan, Passport Photo)
   - Click "Next"

2. **Step 2: Review & Confirm**
   - Review your business information
   - Check the confirmation checkbox
   - Click "Next"

3. **Step 3: Select Payment Method** ← **LOAN OPTION IS HERE**
   - You'll see 4 payment options:
     - Paystack (Card, Bank Transfer, USSD)
     - Flutterwave (Card, Bank Transfer, USSD, Wallet)
     - Direct Bank Transfer
     - **Get a Loan** ← This is the new option!

### 3. Select "Get a Loan" Option

- Click on the "Get a Loan" card
- You'll see:
  - Icon: 📈 TrendingUp
  - Name: "Get a Loan"
  - Description: "Borrow ₦25,000. Repay monthly. Instant approval."
- Click the button: **"Get a Loan Instead"**

### 4. Loan Flow

After clicking "Get a Loan Instead", you'll be taken through:

1. **Loan Eligibility Check** (`/loan/eligibility`)
   - Enter NIN, monthly income, employment type
   - Check eligibility

2. **Loan Offers** (`/loan/offers`)
   - Compare offers from Lendsqr and Flutterwave
   - Select best offer

3. **Loan Agreement** (`/loan/agreement`)
   - Review loan details
   - Sign agreement

4. **Direct Debit Setup** (`/loan/debit-setup`)
   - Link bank account
   - Confirm OTP

5. **Loan Status** (`/loan/status`)
   - Track approval progress
   - See disbursement status

6. **Repayment Schedule** (`/loan/repayment-schedule`)
   - View full payment schedule
   - See next payment date

## Visual Guide

### Payment Method Selection Screen

```
┌─────────────────────────────────────┐
│  Select Payment Method              │
│  Choose your preferred payment      │
│  method (₦25,000)                  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 💳 Paystack                  │  │
│  │ Card, Bank Transfer, USSD    │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 📱 Flutterwave               │  │
│  │ Card, Bank Transfer, USSD... │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 🏢 Direct Bank Transfer      │  │
│  │ Manual transfer with...      │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 📈 Get a Loan                │  │ ← NEW OPTION
│  │ Borrow ₦25,000. Repay...    │  │
│  └──────────────────────────────┘  │
│                                     │
│  [Get a Loan Instead]              │ ← BUTTON
└─────────────────────────────────────┘
```

## Direct URLs to Test

If you want to test individual pages directly:

- **Loan Eligibility:** `http://localhost:5173/loan/eligibility`
- **Loan Offers:** `http://localhost:5173/loan/offers`
- **Loan Agreement:** `http://localhost:5173/loan/agreement`
- **Debit Setup:** `http://localhost:5173/loan/debit-setup`
- **Loan Status:** `http://localhost:5173/loan/status`
- **Repayment Schedule:** `http://localhost:5173/loan/repayment-schedule`

## Troubleshooting

### If you don't see the "Get a Loan" option:

1. **Check you're on Step 3 of Business Registration**
   - Make sure you've completed Steps 1 and 2
   - The payment method selection is Step 3

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for any errors
   - Check if routes are loading correctly

3. **Verify Server is Running**
   - Make sure Docker container is running
   - Check `http://localhost:5173` is accessible
   - Restart server if needed

4. **Clear Browser Cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Clear cache and reload

### If loan pages show errors:

1. **Check File Existence**
   ```bash
   ls -la src/app/pages/Loan*.tsx
   ```
   Should show 6 loan-related files

2. **Check Routes**
   - Verify routes are in `src/app/App.tsx`
   - All 6 loan routes should be present

3. **Check Imports**
   - Verify all imports are correct
   - Check for missing dependencies

## Testing the Complete Flow

1. **Start from Dashboard**
   ```
   Login → Dashboard → Business Registration
   ```

2. **Complete Registration Steps**
   ```
   Step 1: Upload Documents → Next
   Step 2: Review → Next
   Step 3: Select "Get a Loan" → Click "Get a Loan Instead"
   ```

3. **Complete Loan Flow**
   ```
   Eligibility → Offers → Agreement → Debit Setup → Status → Dashboard
   ```

## What You Should See

### On Payment Selection (Step 3):
- ✅ 4 payment method cards
- ✅ "Get a Loan" card with 📈 icon
- ✅ Button says "Get a Loan Instead" when loan is selected

### After Clicking "Get a Loan Instead":
- ✅ Navigates to `/loan/eligibility`
- ✅ Shows eligibility check form
- ✅ Can proceed through entire loan flow

### On Dashboard (After Loan Setup):
- ✅ "Active Loan" card appears
- ✅ Shows loan balance, monthly payment, next payment date
- ✅ Link to repayment schedule

## Files Created

All loan pages are in `src/app/pages/`:
- ✅ `LoanEligibilityPage.tsx`
- ✅ `LoanOffersPage.tsx`
- ✅ `LoanAgreementPage.tsx`
- ✅ `LoanDebitSetupPage.tsx`
- ✅ `LoanStatusPage.tsx`
- ✅ `LoanRepaymentSchedulePage.tsx`

## Still Not Seeing It?

If you're still not seeing the loan option:

1. **Restart the development server:**
   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

2. **Check the browser:**
   - Make sure you're on the correct step (Step 3)
   - Scroll down to see all payment options
   - The loan option is the 4th card

3. **Verify the code:**
   - Check `BusinessRegistrationPage.tsx` line 29
   - Should have: `{ id: 'loan', name: 'Get a Loan', ... }`

4. **Check console for errors:**
   - Open browser DevTools
   - Look for any React errors or route errors

---

**Need Help?** Check `LOAN_INTEGRATION_SUMMARY.md` for full implementation details.
