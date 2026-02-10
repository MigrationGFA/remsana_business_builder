# 🚀 Quick Test Guide

## Test Credentials

### Option 1: Use Test Login Buttons (Easiest)
On the login page, you'll see a **Test Login Helper** widget in the bottom-right corner with quick login buttons:
- **Login as Test User** - Uses `test@remsana.com`
- **Login as SME Owner** - Uses `smeowner@business.ng`
- **Login as Demo User** - Uses `demo@remsana.com`

Just click any button to log in instantly!

### Option 2: Manual Login
Use these credentials:

**Test User:**
```
Email: test@remsana.com
Password: Test1234!
```

**SME Owner:**
```
Email: smeowner@business.ng
Password: Business2026!
```

**Demo User:**
```
Email: demo@remsana.com
Password: Demo1234!
```

## Test Flow

1. **Start at Splash Screen** (`/`)
   - Should auto-navigate to login after 2-3 seconds

2. **Login Page** (`/login`)
   - Use test credentials above
   - Or click test login button
   - Should navigate to dashboard

3. **Dashboard** (`/dashboard`)
   - View registration status
   - Check learning progress
   - See certificates and badges
   - View recent activity

4. **Onboarding** (`/onboarding`)
   - Complete 5-step questionnaire
   - Fill business information
   - Review and submit

5. **Learning Centre** (`/learning`)
   - Browse course modules
   - View progress
   - Start lessons

6. **Lesson Player** (`/lesson/:id`)
   - Watch video (placeholder)
   - View resources
   - Take quiz

7. **Quiz** (`/quiz/:id`)
   - Answer questions
   - View progress
   - Submit answers

8. **Quiz Results** (`/quiz-results/:id`)
   - View score
   - See feedback
   - Review questions

## Quick Navigation

After logging in, you can manually navigate to:
- `/dashboard` - Main dashboard
- `/onboarding` - Business questionnaire
- `/learning` - Learning centre
- `/lesson/1` - Lesson player (use any number)
- `/quiz/1` - Quiz page
- `/business-registration` - Registration steps

## Reset Test Data

Clear browser storage:
```javascript
localStorage.clear();
location.reload();
```

Or use DevTools → Application → Local Storage → Clear

---

**Happy Testing! 🎉**
