import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Settings, Download, Play, BookOpen, Trophy, TrendingUp, Menu, LogOut, CheckCircle2, Clock, FileText, Shield, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, LinearProgress, Modal, ModalFooter, Alert, LegalModals } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [savedOnboardingProgress, setSavedOnboardingProgress] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('remsana_auth_token');
    localStorage.removeItem('remsana_user');
    navigate('/login');
  };

  useEffect(() => {
    // Check for saved onboarding progress
    const saved = localStorage.getItem('remsana_onboarding_progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setSavedOnboardingProgress(progress);
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  // Check for active loan
  const activeLoan = localStorage.getItem('loan_debit_setup') === 'true' 
    ? JSON.parse(localStorage.getItem('selected_loan_offer') || '{}')
    : null;

  const handleDownloadCertificate = () => {
    setDownloadingCertificate(true);
    // Simulate download
    setTimeout(() => {
      setDownloadingCertificate(false);
      setShowDownloadModal(false);
      // In production, this would trigger actual file download
    }, 1500);
  };

  const handleResumeOnboarding = () => {
    navigate('/onboarding');
  };

  const handleDismissOnboardingReminder = () => {
    localStorage.removeItem('remsana_onboarding_progress');
    setSavedOnboardingProgress(null);
  };
  const registrationStatus = {
    status: 'verification_in_progress' as const,
    paymentStatus: 'verified' as const,
    paymentDate: '2026-01-25',
    paymentMethod: 'Paystack',
    paymentAmount: 25000,
    transactionReference: 'TXN-1769542087',
    approvalDate: null,
    certificateUrl: null,
    businessName: 'My Amazing Business Inc.',
    businessType: 'Limited Liability Company',
    location: 'Lagos Island, Lagos',
    submittedToCAC: false,
    estimatedCompletionDate: '2026-02-20',
  };

  const learningProgress = {
    currentDay: 23,
    totalDays: 100,
    completionPercentage: 23,
    lessonsCompleted: 23,
    averageScore: 84,
    lastCompletedLesson: {
      day: 23,
      title: 'Pricing Strategy & Positioning',
      score: 88,
      completedAt: '2026-01-26',
    },
    estimatedCompletionDate: '2026-04-20',
  };

  const certificates = [
    {
      id: '1',
      title: 'Business Fundamentals',
      phase: 1,
      earnedDate: '2026-01-15',
      certificateUrl: '/certificates/fundamentals.pdf',
    },
  ];

  const recentActivity = [
    { type: 'lesson', text: 'Completed Lesson 23 - Pricing Strategy & Positioning', score: 88, time: 'Today, 2:30 PM' },
    { type: 'badge', text: 'Unlocked Badge "Weekly Streaker"', time: 'Today, 2:15 PM' },
    { type: 'certificate', text: 'Certificate Ready - Business Fundamentals', time: 'Yesterday, 11:20 AM' },
    { type: 'lesson', text: 'Started Day 22 - Market Research Techniques', time: '2 days ago' },
    { type: 'quiz', text: 'Quiz Passed - Financial Management Basics', score: 92, time: '3 days ago' },
  ];

  const recommendedResources = [
    { id: '1', title: 'Financial Planning Template', category: 'Finance', format: 'xlsx', size: '2.4 MB' },
    { id: '2', title: 'Marketing Basics Guide', category: 'Marketing', format: 'pdf', size: '5.2 MB' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-[#218D8D]/10 text-[#218D8D] border-[#218D8D]/30';
      case 'certificate_ready':
        return 'bg-[#218D8D]/10 text-[#218D8D] border-[#218D8D]/30';
      case 'submitted_to_cac':
        return 'bg-[#1C1C8B]/10 text-[#1C1C8B] border-[#1C1C8B]/30';
      case 'verification_in_progress':
        return 'bg-[#A84B2F]/10 text-[#A84B2F] border-[#A84B2F]/30';
      case 'payment_verified':
        return 'bg-[#218D8D]/10 text-[#218D8D] border-[#218D8D]/30';
      case 'pending':
        return 'bg-[#A84B2F]/10 text-[#A84B2F] border-[#A84B2F]/30';
      case 'rejected':
        return 'bg-[#C01F2F]/10 text-[#C01F2F] border-[#C01F2F]/30';
      default:
        return 'bg-[#626C71]/10 text-[#626C71] border-[#626C71]/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'payment_verified':
        return 'Payment Verified';
      case 'verification_in_progress':
        return 'Verification In Progress';
      case 'submitted_to_cac':
        return 'Submitted to CAC';
      case 'approved':
        return 'Approved by CAC';
      case 'certificate_ready':
        return 'Certificate Ready';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img 
              src={remsanaIcon} 
              alt="REMSANA" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain cursor-pointer flex-shrink-0"
              onClick={() => navigate('/dashboard')}
            />
            <div className="min-w-0">
              <h1 className="text-[14px] sm:text-[18px] font-semibold text-[#1F2121] truncate">
                REMSANA
              </h1>
              <p className="text-[10px] sm:text-[12px] text-[#6B7C7C] truncate">
                SME Business Builder Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-1 sm:gap-2">
            <button 
              onClick={() => navigate('/learning')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[14px] text-[#1C1C8B] hover:bg-[#f3f0fa] rounded-[8px] transition-colors font-medium"
            >
              Learning
            </button>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[14px] text-[#1C1C8B] hover:bg-[#f3f0fa] rounded-[8px] transition-colors font-medium"
            >
              Onboarding
            </button>
            <button className="relative p-1.5 sm:p-2 hover:bg-[#f3f0fa] rounded-full transition-colors">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B7C7C]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C01F2F] rounded-full"></span>
            </button>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 sm:p-2 hover:bg-[#f3f0fa] rounded-full transition-colors"
              title="Help & FAQ"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B7C7C]" />
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-[#f3f0fa] rounded-full transition-colors">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B7C7C]" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-1.5 sm:p-2 hover:bg-[#f3f0fa] rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B7C7C]" />
            </button>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="bg-white border-b border-[#6B7C7C]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-[24px] font-semibold text-[#1F2121] mb-1">
            👋 Welcome back, John!
          </h2>
          <p className="text-[14px] text-[#6B7C7C]">
            Here's what's happening with your business
          </p>
          
          {/* Resume Onboarding Card */}
          {savedOnboardingProgress && (
            <Card className="mt-4 border-[#1C1C8B]/30 bg-[#1C1C8B]/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1C1C8B]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#1C1C8B]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1F2121]">
                        Complete Your Profile
                      </p>
                      <p className="text-[12px] text-[#6B7C7C]">
                        You have incomplete onboarding. Continue from Step {savedOnboardingProgress.currentStep} of 5 ({Math.round((savedOnboardingProgress.currentStep / 5) * 100)}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDismissOnboardingReminder}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleResumeOnboarding}
                    >
                      Continue Setup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Registration Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Business Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 ${getStatusColor(registrationStatus.status)}`}>
                <span className="text-[12px] font-medium">
                  {registrationStatus.status === 'payment_verified' && '✓'}
                  {registrationStatus.status === 'verification_in_progress' && '⏳'}
                  {registrationStatus.status === 'submitted_to_cac' && '🔄'}
                  {registrationStatus.status === 'approved' && '✅'}
                  {registrationStatus.status === 'certificate_ready' && '✅'}
                  {' '}
                  {getStatusLabel(registrationStatus.status)}
                </span>
              </div>
              
              {registrationStatus.status === 'payment_verified' && (
                <>
                  <p className="text-[14px] text-[#6B7C7C] mb-4">
                    Payment received and confirmed. Our team will begin verification within 2-3 business days.
                  </p>
                  <div className="space-y-2 text-[12px] text-[#6B7C7C] mb-4 p-3 bg-[#f3f0fa] rounded-[8px]">
                    <div>
                      <span className="font-medium">Payment Method:</span> {registrationStatus.paymentMethod}
                    </div>
                    <div>
                      <span className="font-medium">Amount Paid:</span> ₦{registrationStatus.paymentAmount.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Transaction Ref:</span> {registrationStatus.transactionReference}
                    </div>
                  </div>
                </>
              )}

              {registrationStatus.status === 'verification_in_progress' && (
                <>
                  <p className="text-[14px] text-[#6B7C7C] mb-4">
                    Our team is reviewing your documents and information. This typically takes 2-3 business days.
                  </p>
                  <div className="space-y-2 text-[12px] text-[#6B7C7C] mb-4 p-3 bg-[#f3f0fa] rounded-[8px]">
                    <div>
                      <span className="font-medium">Payment Verified:</span> ✓ {registrationStatus.paymentDate}
                    </div>
                    <div>
                      <span className="font-medium">Estimated Completion:</span> {registrationStatus.estimatedCompletionDate}
                    </div>
                  </div>
                </>
              )}

              {registrationStatus.status === 'submitted_to_cac' && (
                <>
                  <p className="text-[14px] text-[#6B7C7C] mb-4">
                    Your application has been submitted to CAC. Processing typically takes 10-21 business days.
                  </p>
                  <div className="space-y-2 text-[12px] text-[#6B7C7C] mb-4 p-3 bg-[#f3f0fa] rounded-[8px]">
                    <div>
                      <span className="font-medium">Submitted Date:</span> {registrationStatus.submittedToCAC ? '2026-01-28' : 'Pending'}
                    </div>
                    <div>
                      <span className="font-medium">Estimated Approval:</span> {registrationStatus.estimatedCompletionDate}
                    </div>
                  </div>
                </>
              )}

              {(registrationStatus.status === 'approved' || registrationStatus.status === 'certificate_ready') && (
                <>
                  <p className="text-[14px] text-[#6B7C7C] mb-4">
                    Your business registration has been approved by CAC. Certificate ready for download.
                  </p>
                  <p className="text-[14px] text-[#1F2121] mb-4 font-medium">
                    Certificate ready for download
                  </p>
                </>
              )}

              <Button 
                variant="primary" 
                size="md" 
                className="w-full mb-4"
                onClick={() => navigate('/business-registration')}
              >
                {registrationStatus.certificateUrl ? 'View Details & Download ➜' : 'View Details ➜'}
              </Button>
              <div className="space-y-2 text-[12px] text-[#6B7C7C] pt-4 border-t border-[#6B7C7C]/20">
                <div>
                  <span className="font-medium">Business Name:</span> {registrationStatus.businessName}
                </div>
                <div>
                  <span className="font-medium">Business Type:</span> {registrationStatus.businessType}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {registrationStatus.location}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Loan Card */}
          {activeLoan && activeLoan.loanAmount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Active Loan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-[#6B7C7C]">Loan Balance</span>
                    <span className="text-[18px] font-semibold text-[#1F2121]">
                      ₦{activeLoan.loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <LinearProgress 
                    value={0} 
                    className="mb-2"
                  />
                  <p className="text-[12px] text-[#6B7C7C]">
                    Payments Made: 0/{activeLoan.termMonths || 12}
                  </p>
                </div>
                <div className="space-y-2 text-[12px] mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#6B7C7C]">Monthly Payment:</span>
                    <span className="font-medium text-[#1F2121]">
                      ₦{activeLoan.monthlyPayment?.toLocaleString() || '2,150'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7C7C]">APR:</span>
                    <span className="font-medium text-[#1F2121]">
                      {activeLoan.apr || 8.5}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7C7C]">Next Payment:</span>
                    <span className="font-medium text-[#1F2121]">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/loan/repayment-schedule')}
                >
                  View Repayment Schedule
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Learning Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[18px] font-semibold text-[#1F2121]">
                    Day {learningProgress.currentDay} of {learningProgress.totalDays}
                  </span>
                  <span className="text-[14px] text-[#6B7C7C]">
                    {learningProgress.completionPercentage}%
                  </span>
                </div>
                <LinearProgress 
                  value={learningProgress.completionPercentage} 
                  className="mb-4"
                />
              </div>
              <div className="space-y-2 text-[14px] mb-4">
                <div className="flex justify-between">
                  <span className="text-[#6B7C7C]">Lessons Completed:</span>
                  <span className="text-[#1F2121] font-medium">
                    {learningProgress.lessonsCompleted} out of {learningProgress.totalDays}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C7C]">Average Quiz Score:</span>
                  <span className="text-[#1F2121] font-medium">
                    {learningProgress.averageScore}% ⭐
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C7C]">Time to Completion:</span>
                  <span className="text-[#1F2121] font-medium">
                    ~{learningProgress.totalDays - learningProgress.currentDay} days remaining
                  </span>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="md" 
                className="w-full mb-2"
                onClick={() => navigate('/learning')}
              >
                Continue Learning ➜
              </Button>
              <p className="text-[12px] text-[#6B7C7C]">
                Last Lesson: Day {learningProgress.lastCompletedLesson.day} ({learningProgress.lastCompletedLesson.title})
              </p>
            </CardContent>
          </Card>

          {/* Certificates & Badges Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Certificates & Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.map((cert) => (
                <div key={cert.id} className="mb-4 pb-4 border-b border-[#6B7C7C]/20">
                  <div className="flex items-start gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-[#eda51f] mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-[14px] font-semibold text-[#1F2121]">
                        ⭐ {cert.title}
                      </h4>
                      <p className="text-[12px] text-[#6B7C7C]">
                        Completed: {new Date(cert.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[12px] text-[#6B7C7C]">
                        Earned: Phase {cert.phase} Completion
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowDownloadModal(true)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              ))}
              <div className="text-[12px] text-[#6B7C7C]">
                <p className="font-medium mb-2">🔒 Locked Badges:</p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">🔐 Financial Expert</span>
                    <p className="text-[11px]">[Complete Phase 2]</p>
                  </div>
                  <div>
                    <span className="font-medium">🔐 Marketing Master</span>
                    <p className="text-[11px]">[Complete Phase 3]</p>
                  </div>
                </div>
                <button 
                  className="text-[#1C1C8B] hover:underline mt-2"
                  onClick={() => navigate('/learning')}
                >
                  View All (3 more)
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-[#f3f0fa] rounded-[8px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-[#1C1C8B]" />
                      <span className="text-[14px] font-medium text-[#1F2121]">
                        Continue Day {learningProgress.currentDay + 1}
                      </span>
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate(`/lesson/${learningProgress.currentDay + 1}`)}
                    >
                      Start ➜
                    </Button>
                  </div>
                  <p className="text-[12px] text-[#6B7C7C]">
                    Operational Efficiency
                  </p>
                </div>

                <div className="p-3 bg-[#f3f0fa] rounded-[8px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#1C1C8B]" />
                      <span className="text-[14px] font-medium text-[#1F2121]">
                        Retake Quiz
                      </span>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => navigate('/quiz/23')}
                    >
                      Start ➜
                    </Button>
                  </div>
                  <p className="text-[12px] text-[#6B7C7C]">
                    Leadership Fundamentals - Score: 72% (Retake)
                  </p>
                </div>

                <div className="p-3 bg-[#f3f0fa] rounded-[8px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#1C1C8B]" />
                      <span className="text-[14px] font-medium text-[#1F2121]">
                        Download Resources
                      </span>
                    </div>
                    <Button variant="secondary" size="sm">
                      Download ➜
                    </Button>
                  </div>
                  <p className="text-[12px] text-[#6B7C7C]">
                    Monthly template update
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation Section */}
        <section className="mb-8">
          <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
            🚀 Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="clickable" onClick={() => navigate('/onboarding')}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📝</div>
                <h4 className="text-[14px] font-semibold text-[#1F2121] mb-1">
                  Onboarding
                </h4>
                <p className="text-[12px] text-[#6B7C7C]">
                  Complete profile
                </p>
              </CardContent>
            </Card>
            <Card variant="clickable" onClick={() => navigate('/learning')}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="text-[14px] font-semibold text-[#1F2121] mb-1">
                  Learning
                </h4>
                <p className="text-[12px] text-[#6B7C7C]">
                  Start courses
                </p>
              </CardContent>
            </Card>
            <Card variant="clickable" onClick={() => navigate('/lesson/23')}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">▶️</div>
                <h4 className="text-[14px] font-semibold text-[#1F2121] mb-1">
                  Lessons
                </h4>
                <p className="text-[12px] text-[#6B7C7C]">
                  Watch videos
                </p>
              </CardContent>
            </Card>
            <Card variant="clickable" onClick={() => navigate('/quiz/23')}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">✎</div>
                <h4 className="text-[14px] font-semibold text-[#1F2121] mb-1">
                  Quiz
                </h4>
                <p className="text-[12px] text-[#6B7C7C]">
                  Test knowledge
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recommended Resources */}
        <section className="mb-8">
          <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
            📚 Recommended Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedResources.map((resource) => (
              <Card key={resource.id} variant="hoverable">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-[14px] font-semibold text-[#1F2121] mb-1">
                        {resource.title}
                      </h4>
                      <p className="text-[12px] text-[#6B7C7C] mb-2">
                        {resource.category}
                      </p>
                      <p className="text-[11px] text-[#6B7C7C]">
                        {resource.format.toUpperCase()} • {resource.size}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
            📰 Recent Activity
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => {
                  const handleActivityClick = () => {
                    if (activity.type === 'lesson') {
                      navigate('/lesson/23');
                    } else if (activity.type === 'quiz') {
                      navigate('/quiz/23');
                    } else if (activity.type === 'certificate') {
                      navigate('/dashboard');
                    }
                  };

                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 pb-4 border-b border-[#6B7C7C]/10 last:border-0 last:pb-0 ${
                        activity.type === 'lesson' || activity.type === 'quiz' ? 'cursor-pointer hover:bg-[#f3f0fa] p-2 -m-2 rounded-[8px] transition-colors' : ''
                      }`}
                      onClick={handleActivityClick}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#f3f0fa] flex items-center justify-center flex-shrink-0">
                        {activity.type === 'lesson' && <BookOpen className="w-4 h-4 text-[#1C1C8B]" />}
                        {activity.type === 'badge' && <Trophy className="w-4 h-4 text-[#eda51f]" />}
                        {activity.type === 'certificate' && <Trophy className="w-4 h-4 text-[#218D8D]" />}
                        {activity.type === 'quiz' && <TrendingUp className="w-4 h-4 text-[#1C1C8B]" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] text-[#1F2121]">
                          {activity.text}
                          {activity.score && (
                            <span className="text-[#218D8D] font-medium ml-1">
                              - Score: {activity.score}%
                            </span>
                          )}
                        </p>
                        <p className="text-[12px] text-[#6B7C7C] mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Download Certificate Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => {
          if (!downloadingCertificate) {
            setShowDownloadModal(false);
          }
        }}
        title="Download Certificate"
        size="sm"
        showCloseButton={!downloadingCertificate}
      >
        <div className="py-4">
          {!downloadingCertificate ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 bg-[#f3f0fa] rounded-[8px] mb-4">
                  <Trophy className="w-8 h-8 text-[#1C1C8B]" />
                  <div>
                    <p className="text-[14px] font-semibold text-[#1F2121]">Business Fundamentals</p>
                    <p className="text-[12px] text-[#6B7C7C]">Completed: Jan 15, 2026</p>
                  </div>
                </div>
                <p className="text-[14px] text-[#6B7C7C]">
                  Your certificate is ready for download. This is a PDF file that you can print or share.
                </p>
              </div>
              <ModalFooter>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowDownloadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleDownloadCertificate}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </ModalFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#1C1C8B] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[14px] text-[#6B7C7C]">
                Preparing your certificate...
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Legal Modals - Shared component */}
      <LegalModals
        showTerms={showTermsModal}
        showPrivacy={showPrivacyModal}
        showHelp={showHelpModal}
        onCloseTerms={() => setShowTermsModal(false)}
        onClosePrivacy={() => setShowPrivacyModal(false)}
        onCloseHelp={() => setShowHelpModal(false)}
      />
    </div>
  );
}
