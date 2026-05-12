import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Download, Play, BookOpen, Trophy, TrendingUp, LogOut, Clock, HelpCircle, MessageCircle, HeadphonesIcon, Shield, Settings, CreditCard, Menu, X, ChevronRight, Briefcase, GraduationCap, Wallet, FileText, Home } from 'lucide-react';
import { Button, LinearProgress, Modal, ModalFooter, LegalModals } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getNavbarNotifications, getNavbarProfile, type NavbarNotification, type NavbarProfile } from '../api/navbarApi';
import { dashboardApi } from '../api/dashboardApi';
import { hasEngagementService } from '../api/httpClient';
import { getOnboardingProgress, hasBackend } from '../api/onboardingApi';
import { loansApi } from '../api/loansApi';

type NavbarLink = {
  id: string;
  label: string;
  path: string;
};

const baseNavLinks: NavbarLink[] = [
  { id: 'learning', label: 'Learning', path: '/learning' },
  { id: 'onboarding', label: 'Onboarding', path: '/onboarding' },
];

const engagementNavLinks: NavbarLink[] = [
  { id: 'support', label: 'Support', path: '/support' },
  { id: 'chat', label: 'Chat', path: '/chat' },
];

const defaultNavLinks: NavbarLink[] = hasEngagementService()
  ? [...baseNavLinks, ...engagementNavLinks]
  : baseNavLinks;

/** Skeleton block used while dashboard data is loading */
function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200/60 rounded-lg animate-pulse ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <SkeletonBlock className="h-5 w-28" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-10 w-full mt-3" />
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [savedOnboardingProgress, setSavedOnboardingProgress] = useState<any>(null);
  const [navbarLoading, setNavbarLoading] = useState(true);
  const [navbarProfile, setNavbarProfile] = useState<NavbarProfile | null>(null);
  const [navbarNotifications, setNavbarNotifications] = useState<NavbarNotification[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState<any>(null);
  const [learningProgress, setLearningProgress] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<any[]>([]);
  const [activeLoan, setActiveLoan] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('remsana_auth_token');
    localStorage.removeItem('remsana_user');
    navigate('/login');
  };

  useEffect(() => {
    if (hasBackend()) {
      getOnboardingProgress()
        .then((res) => {
          if (!res.is_complete && (res.current_step > 1 || Object.values(res.form_data || {}).some(Boolean))) {
            setSavedOnboardingProgress({ currentStep: res.current_step, formData: res.form_data });
          }
        })
        .catch(() => {});
    } else {
      const saved = localStorage.getItem('remsana_onboarding_progress');
      if (saved) {
        try {
          setSavedOnboardingProgress(JSON.parse(saved));
        } catch (_) {}
      }
    }
  }, []);

  useEffect(() => {
    if (!showProfileMenu) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    let isMounted = true;

    const loadNavbar = async () => {
      setNavbarLoading(true);
      try {
        const [profile, notifications] = await Promise.all([
          getNavbarProfile(),
          getNavbarNotifications(),
        ]);

        if (!isMounted) {
          return;
        }

        setNavbarProfile(profile);
        setNavbarNotifications(notifications ?? []);
      } catch (error) {
        console.error('Failed to load navbar data:', error);
      } finally {
        if (isMounted) {
          setNavbarLoading(false);
        }
      }
    };

    loadNavbar();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasBackend()) {
      setDashboardLoading(true);
      dashboardApi.getMe().then((data) => {
        if (data) {
          console.log('📋 Dashboard API response:', JSON.stringify(data, null, 2));
          console.log('📋 registrationStatus:', data.registrationStatus);
          setRegistrationStatus(data.registrationStatus || null);
          setLearningProgress(data.learningProgress || null);
          setCertificates(data.certificates || []);
          setRecentActivity(data.recentActivity || []);
          setRecommendedResources(data.recommendedResources || []);
        }
      }).catch((err) => {
        console.warn('Dashboard API not available yet:', err.message);
      }).finally(() => {
        setDashboardLoading(false);
      });
    } else {
      setDashboardLoading(false);
    }
  }, []);

  // Load active loan from API or localStorage
  useEffect(() => {
    if (hasBackend()) {
      loansApi.getMyApplication()
        .then((app) => {
          if (app) {
            setActiveLoan(app);
          }
        })
        .catch(() => {});
    } else {
      try {
        if (localStorage.getItem('loan_debit_setup') === 'true') {
          setActiveLoan(JSON.parse(localStorage.getItem('selected_loan_offer') || '{}'));
        }
      } catch {
        // Malformed JSON in localStorage
      }
    }
  }, []);

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
    if (!hasBackend()) {
      localStorage.removeItem('remsana_onboarding_progress');
    }
    setSavedOnboardingProgress(null);
  };
  const formatDate = (value?: string) => {
    if (!value) {
      return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const displayName = navbarProfile?.name || navbarProfile?.email?.split('@')[0] || 'User';
  const unreadNotifications = navbarNotifications.filter((notification) => !notification.read).length;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50 pb-20 md:pb-0">

      {/* ─── Top Header ─── */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <img
              src={remsanaIcon}
              alt="REMSANA"
              className="w-9 h-9 object-contain cursor-pointer"
              onClick={() => navigate('/dashboard')}
            />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-[#1F2121] leading-tight">REMSANA</h1>
              <p className="text-[11px] text-gray-400 -mt-0.5">Business Builder</p>
            </div>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {defaultNavLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => navigate(link.path)}
                className="px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-[#1C1C8B] hover:bg-[#1C1C8B]/5 rounded-xl transition-all"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Notifications */}
            {!navbarLoading && (
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Notifications">
                <Bell className="w-5 h-5 text-gray-500" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            )}
            {/* Help */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="hidden sm:flex p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="Help"
            >
              <HelpCircle className="w-5 h-5 text-gray-500" />
            </button>

            {/* Profile dropdown (desktop) */}
            {!navbarLoading && (
              <div className="relative hidden md:block" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1C1C8B] to-[#667eea] flex items-center justify-center text-white text-xs font-semibold">
                    {(navbarProfile?.name?.[0] || navbarProfile?.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{displayName}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 z-40 overflow-hidden">
                    {/* Profile card header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-[#1C1C8B] to-[#667eea]">
                      <p className="text-sm font-semibold text-white">{navbarProfile?.name || 'Profile'}</p>
                      <p className="text-xs text-white/70 truncate">{navbarProfile?.email || '—'}</p>
                    </div>
                    {/* Profile stats grid */}
                    <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-b border-gray-50">
                      <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="font-medium text-gray-700 capitalize">{navbarProfile?.tier || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Status</span><span className="font-medium text-gray-700 capitalize">{navbarProfile?.status || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">MFA</span><span className="font-medium text-gray-700">{navbarProfile?.mfaEnabled ? 'On' : 'Off'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">NPS</span><span className="font-medium text-gray-700">{navbarProfile?.npsScore ?? '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="font-medium text-gray-700">{navbarProfile?.phone || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Since</span><span className="font-medium text-gray-700">{formatDate(navbarProfile?.signupDate)}</span></div>
                    </div>
                    {/* Menu links */}
                    <div className="p-2 space-y-0.5">
                      {[
                        { icon: Settings, label: 'Profile & Settings', path: '/profile' },
                        { icon: Shield, label: 'MFA Security', path: '/mfa-setup' },
                        { icon: HeadphonesIcon, label: 'Support', path: '/support' },
                        { icon: MessageCircle, label: 'Chat', path: '/chat' },
                        { icon: CreditCard, label: 'Loan Application', path: '/loan/eligibility' },
                      ].map(({ icon: Icon, label, path }) => (
                        <button
                          key={path}
                          onClick={() => { setShowProfileMenu(false); navigate(path); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-[#1C1C8B] hover:bg-[#1C1C8B]/5 rounded-xl transition-all"
                        >
                          <Icon className="w-4 h-4" /> {label}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Desktop logout (shown when no profile dropdown) */}
            {navbarLoading && (
              <button onClick={handleLogout} className="hidden md:flex p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Logout">
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Mobile Slide-Out Menu ─── */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
            {/* Menu header */}
            <div className="px-5 py-5 bg-gradient-to-r from-[#1C1C8B] to-[#667eea] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{navbarProfile?.name || displayName}</p>
                <p className="text-xs text-white/70 truncate">{navbarProfile?.email || ''}</p>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="p-1 rounded-lg bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Stats bar */}
            <div className="px-5 py-3 bg-[#1C1C8B]/5 flex justify-between text-xs border-b border-gray-100">
              <div className="text-center"><div className="font-semibold text-[#1C1C8B]">{navbarProfile?.tier || '—'}</div><div className="text-gray-400">Plan</div></div>
              <div className="text-center"><div className="font-semibold text-[#1C1C8B]">{navbarProfile?.mfaEnabled ? 'On' : 'Off'}</div><div className="text-gray-400">MFA</div></div>
              <div className="text-center"><div className="font-semibold text-[#1C1C8B]">{navbarProfile?.npsScore ?? '—'}</div><div className="text-gray-400">NPS</div></div>
            </div>
            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {[
                { icon: Home, label: 'Dashboard', path: '/dashboard' },
                { icon: GraduationCap, label: 'Learning Centre', path: '/learning' },
                { icon: FileText, label: 'Onboarding', path: '/onboarding' },
                { icon: Briefcase, label: 'Business Registration', path: '/business-registration' },
                { icon: Wallet, label: 'Loans', path: '/loan/eligibility' },
                { icon: Settings, label: 'Profile & Settings', path: '/profile' },
                { icon: Shield, label: 'MFA Security', path: '/mfa-setup' },
                ...(hasEngagementService() ? [
                  { icon: HeadphonesIcon, label: 'Support', path: '/support' },
                  { icon: MessageCircle, label: 'Chat', path: '/chat' },
                ] : []),
                { icon: HelpCircle, label: 'Help & FAQ', path: '' },
              ].map(({ icon: Icon, label, path }) => (
                <button
                  key={label}
                  onClick={() => {
                    setShowMobileMenu(false);
                    if (label === 'Help & FAQ') { setShowHelpModal(true); } else { navigate(path); }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#1C1C8B] hover:bg-[#1C1C8B]/5 rounded-xl transition-all"
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                  {label}
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </button>
              ))}
            </div>
            {/* Logout */}
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => { setShowMobileMenu(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero Welcome Section ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C8B] via-[#2d2da0] to-[#667eea]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Welcome back</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{displayName}</h2>
              <p className="text-white/50 text-sm mt-1">Here's what's happening with your business</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20" onClick={() => navigate('/business-registration')}>
                <Briefcase className="w-4 h-4 mr-1.5" /> Register Business
              </Button>
              <Button variant="primary" size="sm" className="!bg-white !text-[#1C1C8B] hover:!bg-white/90" onClick={() => navigate('/learning')}>
                <Play className="w-4 h-4 mr-1.5" /> Continue Learning
              </Button>
            </div>
          </div>

          {/* Onboarding Resume Banner */}
          {savedOnboardingProgress && (
            <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Complete Your Profile</p>
                <p className="text-xs text-white/60 mt-0.5">
                  Step {savedOnboardingProgress.currentStep} of 5 — {Math.round((savedOnboardingProgress.currentStep / 5) * 100)}% complete
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" size="sm" className="flex-1 sm:flex-auto !bg-transparent !border-white/30 !text-white/80 hover:!bg-white/10" onClick={handleDismissOnboardingReminder}>Dismiss</Button>
                <Button variant="primary" size="sm" className="flex-1 sm:flex-auto !bg-white !text-[#1C1C8B]" onClick={handleResumeOnboarding}>Continue</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">

        {/* ─── Status Cards Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">

          {/* Registration Status Card */}
          {dashboardLoading ? <CardSkeleton /> : registrationStatus ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#1C1C8B] to-[#667eea]" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1C1C8B]/10 flex items-center justify-center">
                      <Briefcase className="w-4.5 h-4.5 text-[#1C1C8B]" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Business Registration</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusColor(registrationStatus.status)}`}>
                    {getStatusLabel(registrationStatus.status)}
                  </span>
                </div>

                {registrationStatus.status === 'payment_verified' && (
                  <p className="text-xs text-gray-500 mb-3">Payment received. Verification begins within 2-3 business days.</p>
                )}
                {registrationStatus.status === 'verification_in_progress' && (
                  <p className="text-xs text-gray-500 mb-3">Documents under review. Typically takes 2-3 business days.</p>
                )}
                {registrationStatus.status === 'submitted_to_cac' && (
                  <p className="text-xs text-gray-500 mb-3">Submitted to CAC. Processing takes 10-21 business days.</p>
                )}
                {(registrationStatus.status === 'approved' || registrationStatus.status === 'certificate_ready') && (
                  <p className="text-xs text-green-600 font-medium mb-3">Approved! Certificate ready for download.</p>
                )}

                {/* Detail chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {registrationStatus.businessName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-[11px] text-gray-600">{registrationStatus.businessName}</span>
                  )}
                  {registrationStatus.businessType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-[11px] text-gray-600">{registrationStatus.businessType}</span>
                  )}
                  {registrationStatus.location && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-[11px] text-gray-600">{registrationStatus.location}</span>
                  )}
                </div>

                <button
                  onClick={() => navigate('/business-registration')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#1C1C8B] bg-[#1C1C8B]/5 hover:bg-[#1C1C8B]/10 rounded-xl transition-colors"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300" />
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Briefcase className="w-4.5 h-4.5 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Business Registration</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">Register your business with CAC to formalize your operations.</p>
                <button
                  onClick={() => navigate('/business-registration')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#1C1C8B] bg-[#1C1C8B]/5 hover:bg-[#1C1C8B]/10 rounded-xl transition-colors"
                >
                  Start Registration <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Learning Progress Card */}
          {dashboardLoading ? <CardSkeleton /> : learningProgress ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#218D8D] to-[#2dd4bf]" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#218D8D]/10 flex items-center justify-center">
                      <GraduationCap className="w-4.5 h-4.5 text-[#218D8D]" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Learning Progress</h3>
                  </div>
                  <span className="text-lg font-bold text-[#218D8D]">{learningProgress.completionPercentage}%</span>
                </div>

                <LinearProgress value={learningProgress.completionPercentage} className="mb-3" />

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <p className="text-base font-bold text-gray-900">{learningProgress.currentDay}</p>
                    <p className="text-[10px] text-gray-400">Current Day</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <p className="text-base font-bold text-gray-900">{learningProgress.lessonsCompleted}</p>
                    <p className="text-[10px] text-gray-400">Completed</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <p className="text-base font-bold text-gray-900">{learningProgress.averageScore}%</p>
                    <p className="text-[10px] text-gray-400">Avg Score</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/learning')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-[#218D8D] hover:bg-[#1a7a7a] rounded-xl transition-colors"
                >
                  <Play className="w-4 h-4" /> Continue Learning
                </button>
                {learningProgress.lastCompletedLesson && (
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    Last: Day {learningProgress.lastCompletedLesson.day} — {learningProgress.lastCompletedLesson.title}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#218D8D] to-[#2dd4bf]" />
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#218D8D]/10 flex items-center justify-center">
                    <GraduationCap className="w-4.5 h-4.5 text-[#218D8D]" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Learning Progress</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">Start learning to build crucial business skills.</p>
                <button
                  onClick={() => navigate('/learning')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-[#218D8D] hover:bg-[#1a7a7a] rounded-xl transition-colors"
                >
                  Start Learning <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Active Loan Card OR Certificates Card */}
          {activeLoan && activeLoan.loanAmount ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Wallet className="w-4.5 h-4.5 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Active Loan</h3>
                  </div>
                  <span className="text-lg font-bold text-gray-900">₦{activeLoan.loanAmount.toLocaleString()}</span>
                </div>

                <LinearProgress value={0} className="mb-3" />

                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between"><span className="text-gray-400">Monthly Payment</span><span className="font-medium text-gray-700">₦{activeLoan.monthlyPayment?.toLocaleString() || '2,150'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">APR</span><span className="font-medium text-gray-700">{activeLoan.apr || 8.5}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Payments</span><span className="font-medium text-gray-700">0/{activeLoan.termMonths || 12}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Next Payment</span><span className="font-medium text-gray-700">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></div>
                </div>

                <button
                  onClick={() => navigate('/loan/repayment-schedule')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                >
                  Repayment Schedule <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : dashboardLoading ? <CardSkeleton /> : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-300" />
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Trophy className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Certificates & Badges</h3>
                </div>

                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="flex items-center gap-3 p-2.5 bg-amber-50/50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{cert.title}</p>
                          <p className="text-[10px] text-gray-400">{cert.earnedDate ? new Date(cert.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</p>
                        </div>
                        <button onClick={() => setShowDownloadModal(true)} className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors">
                          <Download className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-xs text-gray-400">Complete courses to earn certificates</p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                  <p className="text-[11px] font-medium text-gray-400">Locked Badges</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] text-gray-400">🔐 Financial Expert</span>
                    <span className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] text-gray-400">🔐 Marketing Master</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Quick Actions ─── */}
        {!dashboardLoading && (
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigate(`/lesson/${(learningProgress?.currentDay ?? 0) + 1}`)}
                className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1C1C8B]/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1C1C8B]/10 group-hover:bg-[#1C1C8B] flex items-center justify-center transition-colors">
                  <Play className="w-5 h-5 text-[#1C1C8B] group-hover:text-white transition-colors" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-gray-900">Next Lesson</p>
                  <p className="text-[11px] text-gray-400">Day {(learningProgress?.currentDay ?? 0) + 1}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1C1C8B] transition-colors" />
              </button>

              <button
                onClick={() => navigate('/quiz/23')}
                className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#218D8D]/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#218D8D]/10 group-hover:bg-[#218D8D] flex items-center justify-center transition-colors">
                  <BookOpen className="w-5 h-5 text-[#218D8D] group-hover:text-white transition-colors" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-gray-900">Retake Quiz</p>
                  <p className="text-[11px] text-gray-400">Leadership Fundamentals</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#218D8D] transition-colors" />
              </button>

              <button
                className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-300/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-500 flex items-center justify-center transition-colors">
                  <Download className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-gray-900">Resources</p>
                  <p className="text-[11px] text-gray-400">Templates & guides</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Quick Navigation Grid ─── */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Navigation</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { emoji: '📝', label: 'Onboarding', desc: 'Complete profile', path: '/onboarding', color: 'from-violet-500/10 to-purple-500/10' },
              { emoji: '📚', label: 'Learning', desc: 'Start courses', path: '/learning', color: 'from-teal-500/10 to-emerald-500/10' },
              { emoji: '🏢', label: 'CAC Registration', desc: 'Register business', path: '/business-registration', color: 'from-blue-500/10 to-indigo-500/10' },
              { emoji: '💰', label: 'Loans', desc: 'Check eligibility', path: '/loan/eligibility', color: 'from-amber-500/10 to-orange-500/10' },
              ...(hasEngagementService() ? [
                { emoji: '🎧', label: 'Support', desc: 'Get help', path: '/support', color: 'from-pink-500/10 to-rose-500/10' },
                { emoji: '💬', label: 'Chat', desc: 'Live messaging', path: '/chat', color: 'from-cyan-500/10 to-sky-500/10' },
              ] : []),
              { emoji: '👤', label: 'Profile', desc: 'Settings & plan', path: '/profile', color: 'from-gray-500/10 to-slate-500/10' },
              { emoji: '🔐', label: 'MFA Security', desc: 'Setup 2FA', path: '/mfa-setup', color: 'from-red-500/10 to-rose-500/10' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="group p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1C1C8B]/20 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl mb-2.5`}>
                  {item.emoji}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#1C1C8B] transition-colors">{item.label}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Recommended Resources ─── */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Recommended Resources</h3>
          {dashboardLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : recommendedResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendedResources.map((resource) => (
                <div key={resource.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#1C1C8B]/5 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#1C1C8B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{resource.title}</h4>
                    <p className="text-[11px] text-gray-400">{resource.category} · {resource.format?.toUpperCase()} · {resource.size}</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center">
              <p className="text-sm text-gray-400">No recommended resources available yet.</p>
            </div>
          )}
        </div>

        {/* ─── Recent Activity ─── */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h3>
          {dashboardLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-full" />
                    <SkeletonBlock className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {recentActivity.map((activity, idx) => {
                const handleActivityClick = () => {
                  if (activity.type === 'lesson') navigate('/lesson/23');
                  else if (activity.type === 'quiz') navigate('/quiz/23');
                  else if (activity.type === 'certificate') navigate('/dashboard');
                };

                const icons: Record<string, { icon: typeof BookOpen; color: string; bg: string }> = {
                  lesson: { icon: BookOpen, color: 'text-[#1C1C8B]', bg: 'bg-[#1C1C8B]/10' },
                  badge: { icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
                  certificate: { icon: Trophy, color: 'text-[#218D8D]', bg: 'bg-[#218D8D]/10' },
                  quiz: { icon: TrendingUp, color: 'text-[#1C1C8B]', bg: 'bg-[#1C1C8B]/10' },
                };
                const config = icons[activity.type] || icons.lesson;
                const ActivityIcon = config.icon;

                return (
                  <button
                    key={idx}
                    onClick={handleActivityClick}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <ActivityIcon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {activity.text}
                        {activity.score && <span className="text-[#218D8D] font-medium ml-1">— {activity.score}%</span>}
                      </p>
                      <p className="text-[11px] text-gray-400">{activity.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center">
              <p className="text-sm text-gray-400">No recent activity yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-30 safe-area-pb">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {[
            { icon: Home, label: 'Home', path: '/dashboard' },
            { icon: GraduationCap, label: 'Learn', path: '/learning' },
            { icon: Briefcase, label: 'Register', path: '/business-registration' },
            { icon: Wallet, label: 'Loans', path: '/loan/eligibility' },
            { icon: User, label: 'Profile', path: '/profile' },
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors text-gray-400 hover:text-[#1C1C8B]"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Modals ─── */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => { if (!downloadingCertificate) setShowDownloadModal(false); }}
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
                <Button variant="secondary" size="md" onClick={() => setShowDownloadModal(false)}>Cancel</Button>
                <Button variant="primary" size="md" onClick={handleDownloadCertificate}>
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
              </ModalFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#1C1C8B] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-[14px] text-[#6B7C7C]">Preparing your certificate...</p>
            </div>
          )}
        </div>
      </Modal>

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
