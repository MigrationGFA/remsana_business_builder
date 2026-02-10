# 🧭 Navigation Guide - Dashboard

## Clickable Elements on Dashboard

### Header Navigation
- **Learning** button → Goes to `/learning` (Learning Centre)
- **Onboarding** button → Goes to `/onboarding` (Business Questionnaire)
- **Logout** icon → Clears session and returns to login

### Status Cards

**Registration Status Card:**
- **"View Details & Download"** button → Goes to `/business-registration`

**Learning Progress Card:**
- **"Continue Learning"** button → Goes to `/learning`

**Certificates Card:**
- **"Download Certificate"** button → Simulates download
- **"View All"** link → Goes to `/learning`

**Quick Actions Card:**
- **"Start"** button (Continue Day 24) → Goes to `/lesson/24`
- **"Start"** button (Retake Quiz) → Goes to `/quiz/23`
- **"Download"** button → Simulates resource download

### Quick Navigation Section (New!)
Four clickable cards:
- **📝 Onboarding** → `/onboarding`
- **📚 Learning** → `/learning`
- **▶️ Lessons** → `/lesson/23`
- **✎ Quiz** → `/quiz/23`

### Recent Activity Feed
- Click on **lesson** activities → Goes to `/lesson/23`
- Click on **quiz** activities → Goes to `/quiz/23`
- Certificate activities → Stays on dashboard

## Direct URL Navigation

You can also navigate directly by typing URLs:
- `/dashboard` - Main dashboard
- `/onboarding` - Business questionnaire (5 steps)
- `/learning` - Learning centre with course list
- `/lesson/23` - Lesson player (change number for different lessons)
- `/quiz/23` - Quiz page
- `/quiz-results/23` - Quiz results page
- `/business-registration` - Document upload and verification

## Test Flow

1. Login → Dashboard appears
2. Click **"Quick Navigation"** cards or header buttons
3. Navigate through:
   - Onboarding → Complete 5-step form
   - Learning → Browse courses
   - Lessons → Watch videos
   - Quiz → Take tests
   - Results → View scores

All navigation is now fully functional! 🎉
