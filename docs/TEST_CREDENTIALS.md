# Test Credentials for Remsana

## 🔐 Test User Accounts

### Admin/Test User 1
```
Email: test@remsana.com
Password: Test1234!
Phone: +2348012345678
```

### SME Owner User 2
```
Email: smeowner@business.ng
Password: Business2026!
Phone: +2348023456789
```

### Demo User 3
```
Email: demo@remsana.com
Password: Demo1234!
Phone: +2348034567890
```

## 📝 Test Business Information

### Business Registration Test Data
```
Business Name: Test Business Enterprises Ltd
Trading Name: TBE
Business Type: Limited Liability Company
Business Phone: +2348012345678
Business Email: info@testbusiness.ng
Business Address: 123 Test Street, Victoria Island
LGA: Lagos Island
State: Lagos
Industry: Technology & IT
Revenue: ₦10M - ₦100M
Employees: 6-20 employees
Goals: Increase revenue, Digitalize operations, Improve customer experience
```

## 🧪 Testing Scenarios

### Scenario 1: New User Registration
1. Use any email (e.g., `newuser@test.com`)
2. Password: `Test1234!`
3. Complete signup form
4. Proceed to onboarding

### Scenario 2: Existing User Login
1. Email: `test@remsana.com`
2. Password: `Test1234!`
3. Should navigate to dashboard

### Scenario 3: Business Registration Flow
1. Login with test credentials
2. Complete onboarding questionnaire (5 steps)
3. Upload documents (test PDFs)
4. Submit registration

### Scenario 4: Learning Progress
1. Login and navigate to Learning Centre
2. Start lessons
3. Complete quizzes
4. View progress on dashboard

## ⚠️ Note

These are **test credentials only**. In production, these would be stored securely in a database with proper authentication.

## 🔄 Reset Test Data

To reset test data, clear browser localStorage:
```javascript
localStorage.clear();
```

Or use browser DevTools → Application → Local Storage → Clear
