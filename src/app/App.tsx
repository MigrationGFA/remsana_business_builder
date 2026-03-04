import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import MfaChallengePage from './pages/MfaChallengePage.tsx';
import MfaSetupPage from './pages/MfaSetupPage.tsx';

/**
 * Main App Component
 * 
 * Wrapped with:
 * - ErrorBoundary: Catches and displays React errors gracefully
 * - AuthProvider: Provides global authentication state to all routes
 * - Router: Handles client-side routing
 * 
 * SECURITY: All authenticated routes are wrapped with ProtectedRoute
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes - no authentication required */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/mfa-challenge" element={<MfaChallengePage />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><LearningCentrePage /></ProtectedRoute>} />
            <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonPlayerPage /></ProtectedRoute>} />
            <Route path="/quiz/:lessonId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/quiz-results/:lessonId" element={<ProtectedRoute><QuizResultsPage /></ProtectedRoute>} />
            <Route path="/business-registration" element={<ProtectedRoute><BusinessRegistrationPage /></ProtectedRoute>} />
            <Route path="/mfa-setup" element={<ProtectedRoute><MfaSetupPage /></ProtectedRoute>} />
            
            {/* Loan flow - all protected */}
            <Route path="/loan/eligibility" element={<ProtectedRoute><LoanEligibilityPage /></ProtectedRoute>} />
            <Route path="/loan/offers" element={<ProtectedRoute><LoanOffersPage /></ProtectedRoute>} />
            <Route path="/loan/agreement" element={<ProtectedRoute><LoanAgreementPage /></ProtectedRoute>} />
            <Route path="/loan/debit-setup" element={<ProtectedRoute><LoanDebitSetupPage /></ProtectedRoute>} />
            <Route path="/loan/status" element={<ProtectedRoute><LoanStatusPage /></ProtectedRoute>} />
            <Route path="/loan/repayment-schedule" element={<ProtectedRoute><LoanRepaymentSchedulePage /></ProtectedRoute>} />
            
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
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
