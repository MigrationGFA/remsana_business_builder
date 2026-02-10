# Business Registration Flow Updates

## Summary of Changes

Based on the corrected specifications, the Business Registration flow has been updated to reflect the **paid CAC registration service** model with **₦25,000 registration fee**.

## Key Updates

### 1. Business Registration Page (`src/app/pages/BusinessRegistrationPage.tsx`)

**Updated Flow (5 Steps):**
1. **Step 1: Document Upload**
   - National ID Photocopy (Required)
   - Proof of Address (Required)
   - Business Plan/Description (Required)
   - Bank Statement (Optional)
   - Passport Photograph (Required)

2. **Step 2: Review & Confirm**
   - Summary of business information
   - Registration fee display: **₦25,000**
   - Confirmation checkbox

3. **Step 3: Payment Method Selection**
   - **Paystack** (Card, Bank Transfer, USSD)
   - **Flutterwave** (Card, Bank Transfer, USSD, Wallet)
   - **Direct Bank Transfer** (Manual verification)

4. **Step 4: Payment Processing**
   - For Paystack/Flutterwave: Simulated payment gateway redirect
   - For Bank Transfer: Display account details with copy buttons
   - Payment confirmation and receipt generation

5. **Step 5: Confirmation & Next Steps**
   - Registration status timeline
   - Expected processing timeline (max 1 month)
   - Next steps information

### 2. Dashboard Updates (`src/app/pages/DashboardPage.tsx`)

**Updated Registration Status Card:**
- Shows payment status and transaction details
- Displays current registration stage:
  - Payment Verified ✓
  - Verification In Progress ⏳
  - Submitted to CAC 🔄
  - Approved by CAC ✅
  - Certificate Ready ✅

**Status Information Displayed:**
- Payment method used
- Amount paid (₦25,000)
- Transaction reference number
- Payment date
- Estimated completion date

### 3. Registration Status Flow

The new status flow matches the corrected specifications:

```
Payment Verified
    ↓
Verification In Progress (2-3 business days)
    ↓
Submitted to CAC (Within 5 business days)
    ↓
Approved by CAC (10-21 business days)
    ↓
Certificate Ready
```

**Total Timeline:** Maximum one month (20-25 business days)

## Payment Integration Details

### Payment Methods Supported:

1. **Paystack**
   - Card payments (Visa, Mastercard)
   - Bank transfers
   - USSD payments
   - Real-time confirmation

2. **Flutterwave**
   - Card payments
   - Bank transfers
   - USSD payments
   - Wallet payments
   - Real-time verification

3. **Direct Bank Transfer**
   - Account details displayed
   - Copy-to-clipboard functionality
   - Payment reference included
   - Manual verification by admin (2-4 hours)

### Payment Amount
- **₦25,000** flat fee per registration
- Includes: Information verification, CAC submission, registration processing, and Business Name Certificate

## Document Requirements

### Required Documents:
- National ID Photocopy (PDF, JPG, PNG - Max 5MB)
- Proof of Address (Utility bill, Bank statement, Lease agreement)
- Business Plan or Description Document (PDF, Word)
- Passport Photograph (JPG, PNG - Max 5MB)

### Optional Documents:
- Bank Statement (for proof of financial capacity)

## User Experience Improvements

1. **File Upload**
   - Drag & drop interface
   - Upload progress indicators
   - File preview and removal
   - Size validation (5MB max)

2. **Payment Flow**
   - Clear payment method selection
   - Bank transfer details with copy buttons
   - Payment confirmation with transaction reference
   - Receipt generation notification

3. **Status Tracking**
   - Visual timeline on dashboard
   - Email notifications at each milestone
   - Estimated completion dates
   - Clear next steps

## Testing the Updated Flow

1. **Start the server** (see `START_SERVER.md`)
2. **Navigate to Business Registration** from dashboard
3. **Upload required documents** (Step 1)
4. **Review information** (Step 2)
5. **Select payment method** (Step 3)
6. **Complete payment** (Step 4)
7. **View confirmation** (Step 5)
8. **Check dashboard** for status updates

## Next Steps

The following features are ready for backend integration:

1. **Payment Gateway Integration**
   - Paystack API integration
   - Flutterwave API integration
   - Payment webhook handling

2. **Document Storage**
   - Secure file upload to backend
   - Document verification system
   - CAC submission automation

3. **Status Management**
   - Real-time status updates
   - Email notification system
   - Certificate generation

4. **Admin Dashboard**
   - Payment verification interface
   - Document review system
   - CAC submission tracking

## Files Modified

- `src/app/pages/BusinessRegistrationPage.tsx` - Complete rewrite with payment flow
- `src/app/pages/DashboardPage.tsx` - Updated registration status display
- `docker-compose.dev.yml` - Removed obsolete version attribute
- `restart-server.sh` - Created restart script
- `START_SERVER.md` - Created startup guide

## Notes

- All payment processing is currently simulated for development
- Real payment gateway integration requires backend API setup
- Document uploads are handled client-side (needs backend storage)
- Status updates are mock data (needs backend integration)
