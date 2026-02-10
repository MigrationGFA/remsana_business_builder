import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import LearningCentrePage from './pages/LearningCentrePage';
import LessonPlayerPage from './pages/LessonPlayerPage';
import QuizPage from './pages/QuizPage';
import QuizResultsPage from './pages/QuizResultsPage';
import BusinessRegistrationPage from './pages/BusinessRegistrationPage';
import LoanEligibilityPage from './pages/LoanEligibilityPage';
import LoanOffersPage from './pages/LoanOffersPage';
import LoanAgreementPage from './pages/LoanAgreementPage';
import LoanDebitSetupPage from './pages/LoanDebitSetupPage';
import LoanStatusPage from './pages/LoanStatusPage';
import LoanRepaymentSchedulePage from './pages/LoanRepaymentSchedulePage';
import {
  InsiderPortalPage,
  InsiderLoginPage,
  InsiderMfaPage,
  AdminDashboardPage,
  AnalystDashboardPage,
  ProtectedInsiderRoute,
} from './pages/insider';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/learning" element={<LearningCentrePage />} />
          <Route path="/lesson/:lessonId" element={<LessonPlayerPage />} />
          <Route path="/quiz/:lessonId" element={<QuizPage />} />
          <Route path="/quiz-results/:lessonId" element={<QuizResultsPage />} />
          <Route path="/business-registration" element={<BusinessRegistrationPage />} />
          <Route path="/loan/eligibility" element={<LoanEligibilityPage />} />
          <Route path="/loan/offers" element={<LoanOffersPage />} />
          <Route path="/loan/agreement" element={<LoanAgreementPage />} />
          <Route path="/loan/debit-setup" element={<LoanDebitSetupPage />} />
          <Route path="/loan/status" element={<LoanStatusPage />} />
          <Route path="/loan/repayment-schedule" element={<LoanRepaymentSchedulePage />} />
          {/* /insider admin portal */}
          <Route path="/insider" element={<InsiderPortalPage />} />
          <Route path="/insider/login" element={<InsiderLoginPage />} />
          <Route path="/insider/mfa" element={<InsiderMfaPage />} />
          <Route
            path="/insider/admin"
            element={
              <ProtectedInsiderRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedInsiderRoute>
            }
          />
          <Route
            path="/insider/analyst"
            element={
              <ProtectedInsiderRoute allowedRoles={['ANALYST']}>
                <AnalystDashboardPage />
              </ProtectedInsiderRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
