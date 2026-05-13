import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/remsana';
import { Play, BookOpen, Trophy, Download, Clock, CheckCircle2, Bell, HelpCircle, Menu, X, ChevronRight, Settings, Shield, HeadphonesIcon, MessageCircle, CreditCard, LogOut, GraduationCap, FileText, Briefcase, Wallet, Home } from 'lucide-react';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getProgramme, getLearningProgress, getCertificates } from '../api/learningApi';
import type { LearningProgramme, LearningModule, LearningProgress } from '../api/learningApi';
import { getNavbarProfile, getNavbarNotifications, type NavbarProfile, type NavbarNotification } from '../api/navbarApi';
import { hasEngagementService } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';

type LessonStatus = 'completed' | 'in_progress' | 'not_started';
type TabFilter = 'in_progress' | 'completed';

function formatDurationShort(sec?: number): string {
  if (!sec || sec <= 0) return '';
  const n = Number(sec);
  if (n < 60) return `${n}s`;
  return `${Math.floor(n / 60)}m`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Nav links
const baseNavLinks = [
  { id: 'learning', label: 'Learning', path: '/learning' },
  { id: 'onboarding', label: 'Onboarding', path: '/onboarding' },
];
const engagementNavLinks = [
  { id: 'support', label: 'Support', path: '/support' },
  { id: 'chat', label: 'Chat', path: '/chat' },
];
const defaultNavLinks = hasEngagementService()
  ? [...baseNavLinks, ...engagementNavLinks]
  : baseNavLinks;

export default function LearningCentrePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [programme, setProgramme] = useState<LearningProgramme | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Array<{ id: string; title: string; issued_at: string; pdf_url?: string }>>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>('in_progress');

  // Navbar state
  const [navbarLoading, setNavbarLoading] = useState(true);
  const [navbarProfile, setNavbarProfile] = useState<NavbarProfile | null>(null);
  const [navbarNotifications, setNavbarNotifications] = useState<NavbarNotification[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('remsana_auth_token');
    localStorage.removeItem('remsana_user');
    navigate('/login');
  };

  useEffect(() => {
    let mounted = true;
    const loadNavbar = async () => {
      setNavbarLoading(true);
      try {
        const [profile, notifications] = await Promise.all([getNavbarProfile(), getNavbarNotifications()]);
        if (!mounted) return;
        setNavbarProfile(profile);
        setNavbarNotifications(notifications ?? []);
      } catch (err) {
        console.error('Failed to load navbar:', err);
      } finally {
        if (mounted) setNavbarLoading(false);
      }
    };
    loadNavbar();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!showProfileMenu) return;
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfileMenu]);

  useEffect(() => {
    Promise.all([getProgramme('100DAY_SME'), getLearningProgress(), getCertificates()])
      .then(([progData, progressData, certs]) => {
        setProgramme(progData);
        setProgress(progressData);
        setCertificates(certs);
      })
      .catch((err) => {
        console.error('Failed to load learning data:', err);
        setError('Failed to load courses. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Build lookup maps
  const progressByLesson = React.useMemo(() => {
    const map = new Map<string, { status: LessonStatus; video_progress_sec: number; completed_at?: string }>();
    for (const p of progress?.progress ?? []) {
      map.set(p.lesson_id, {
        status: p.status as LessonStatus,
        video_progress_sec: Number(p.video_progress_sec) || 0,
        completed_at: p.completed_at,
      });
    }
    return map;
  }, [progress]);

  const completedLessonIds = new Set(
    progress?.progress?.filter((p) => p.status === 'completed').map((p) => p.lesson_id) ?? []
  );
  const inProgressLessonIds = new Set(
    progress?.progress?.filter((p) => p.status === 'in_progress').map((p) => p.lesson_id) ?? []
  );

  const totalLessons = progress?.totalLessons ?? (programme?.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0);
  const lessonsCompleted = progress?.lessonsCompleted ?? completedLessonIds.size;
  const averageScore = progress?.averageScore ?? 0;

  const completionPercentage = React.useMemo(() => {
    const backendPct = progress?.completionPercentage ?? 0;
    if (totalLessons <= 0) return backendPct;
    const allLessons = programme?.modules?.flatMap((m) => m.lessons ?? []) ?? [];
    let blendedScore = completedLessonIds.size;
    for (const lid of inProgressLessonIds) {
      const lp = progressByLesson.get(lid);
      const dur = Number(allLessons.find((l) => l.id === lid)?.duration_sec) || 0;
      if (lp && lp.video_progress_sec > 0 && dur > 0) {
        blendedScore += Math.min(lp.video_progress_sec / dur, 0.95);
      } else if (lp) {
        blendedScore += lp.video_progress_sec > 0 ? 0.5 : 0.1;
      }
    }
    const blendedPct = Math.round((blendedScore / totalLessons) * 100);
    return Math.max(backendPct, blendedPct);
  }, [progress, programme, totalLessons, completedLessonIds, inProgressLessonIds, progressByLesson]);

  // Module filtering based on active tab
  const getModuleStatus = (mod: LearningModule) => {
    const lessons = mod.lessons ?? [];
    const total = lessons.length;
    const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
    const started = lessons.filter((l) => inProgressLessonIds.has(l.id)).length;
    if (total > 0 && completed >= total) return 'completed' as const;
    if (completed > 0 || started > 0) return 'in_progress' as const;
    return 'not_started' as const;
  };

  const filteredModules = React.useMemo(() => {
    if (!programme?.modules) return [];
    return programme.modules.filter((mod) => {
      const status = getModuleStatus(mod);
      if (activeTab === 'completed') return status === 'completed';
      return status === 'in_progress' || status === 'not_started';
    });
  }, [programme, activeTab, completedLessonIds, inProgressLessonIds]);

  const displayName = navbarProfile?.name || user?.full_name || user?.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];
  const unreadNotifications = navbarNotifications.filter((n) => !n.read).length;

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-[#0056D2] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-sm w-full shadow-sm">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* ─── Navbar (matches Dashboard) ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={remsanaIcon} alt="REMSANA" className="w-9 h-9 object-contain cursor-pointer" onClick={() => navigate('/dashboard')} />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-[#1F2121] leading-tight">REMSANA</h1>
              <p className="text-[11px] text-gray-400 -mt-0.5">Business Builder</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {defaultNavLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => navigate(link.path)}
                className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
                  link.id === 'learning'
                    ? 'text-[#0056D2] font-semibold'
                    : 'text-gray-600 hover:text-[#1C1C8B] hover:bg-[#1C1C8B]/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!navbarLoading && (
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Notifications">
                <Bell className="w-5 h-5 text-gray-500" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            )}
            <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Help">
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
                    <div className="px-5 py-4 bg-gradient-to-r from-[#1C1C8B] to-[#667eea]">
                      <p className="text-sm font-semibold text-white">{navbarProfile?.name || 'Profile'}</p>
                      <p className="text-xs text-white/70 truncate">{navbarProfile?.email || '—'}</p>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-b border-gray-50">
                      <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="font-medium text-gray-700 capitalize">{navbarProfile?.tier || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">MFA</span><span className="font-medium text-gray-700">{navbarProfile?.mfaEnabled ? 'On' : 'Off'}</span></div>
                    </div>
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
            <button onClick={() => setShowMobileMenu(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Slide-Out Menu ─── */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="px-5 py-5 bg-gradient-to-r from-[#1C1C8B] to-[#667eea] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{navbarProfile?.name || displayName}</p>
                <p className="text-xs text-white/70 truncate">{navbarProfile?.email || ''}</p>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="p-1 rounded-lg bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
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
              ].map(({ icon: Icon, label, path }) => (
                <button
                  key={label}
                  onClick={() => { setShowMobileMenu(false); navigate(path); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#1C1C8B] hover:bg-[#1C1C8B]/5 rounded-xl transition-all"
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                  {label}
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </button>
              ))}
            </div>
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

      {/* ─── Main Content ─── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Greeting */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1C1C8B] to-[#667eea] flex items-center justify-center text-white text-base sm:text-lg font-bold">
              {firstName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {completionPercentage > 0
                  ? `You're ${completionPercentage}% through your learning journey`
                  : 'Ready to start your learning journey?'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0056D2]/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#0056D2]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{programme?.name ?? '100-Day SME Mastery'}</h2>
                <p className="text-xs text-gray-400">{lessonsCompleted} of {totalLessons} lessons completed</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[#0056D2]">{completionPercentage}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-4">
            <div className="bg-[#0056D2] h-full rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center py-2 px-2 bg-gray-50 rounded-lg">
              <p className="text-base sm:text-lg font-bold text-gray-900">{lessonsCompleted}/{totalLessons}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Lessons</p>
            </div>
            <div className="text-center py-2 px-2 bg-gray-50 rounded-lg">
              <p className="text-base sm:text-lg font-bold text-gray-900">{averageScore > 0 ? `${Math.round(averageScore)}%` : '—'}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Avg Score</p>
            </div>
            <div className="text-center py-2 px-2 bg-gray-50 rounded-lg">
              <p className="text-base sm:text-lg font-bold text-gray-900">{certificates.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Certificates</p>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
              activeTab === 'in_progress'
                ? 'bg-[#0056D2] text-white border-[#0056D2]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
              activeTab === 'completed'
                ? 'bg-[#0056D2] text-white border-[#0056D2]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Course Module Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredModules.length === 0 ? (
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                {activeTab === 'completed' ? <Trophy className="w-6 h-6 text-gray-400" /> : <BookOpen className="w-6 h-6 text-gray-400" />}
              </div>
              <p className="text-sm text-gray-500">
                {activeTab === 'completed' ? 'No completed modules yet. Keep learning!' : 'No courses in progress.'}
              </p>
            </div>
          ) : (
            filteredModules.map((mod) => {
              const lessons = mod.lessons ?? [];
              const total = lessons.length;
              const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
              const inProg = lessons.filter((l) => inProgressLessonIds.has(l.id)).length;
              const status = getModuleStatus(mod);

              // Blended module progress
              let moduleScore = completed;
              for (const l of lessons) {
                if (inProgressLessonIds.has(l.id)) {
                  const lp = progressByLesson.get(l.id);
                  const dur = Number(l.duration_sec) || 0;
                  if (lp && lp.video_progress_sec > 0 && dur > 0) {
                    moduleScore += Math.min(lp.video_progress_sec / dur, 0.95);
                  } else if (lp) {
                    moduleScore += 0.1;
                  }
                }
              }
              const progressPct = total > 0 ? Math.min(Math.round((moduleScore / total) * 100), 100) : 0;

              // Find the first actionable lesson in this module
              const nextLesson = lessons.find((l) => inProgressLessonIds.has(l.id))
                || lessons.find((l) => !completedLessonIds.has(l.id) && !inProgressLessonIds.has(l.id));
              
              // Summary info about next lesson
              const nextLessonTitle = nextLesson?.title;
              const nextLessonDuration = nextLesson ? formatDurationShort(Number(nextLesson.duration_sec) || 0) : '';
              const nextLessonHasQuiz = nextLesson?.has_quiz;

              return (
                <div key={mod.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-5">
                    {/* Module top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Module info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-[#0056D2]/10 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-3.5 h-3.5 text-[#0056D2]" />
                          </div>
                          <span className="text-xs text-gray-400 font-medium">Day {mod.day_start}–{mod.day_end}</span>
                          {status === 'completed' && (
                            <span className="ml-auto sm:ml-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{mod.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">
                          Course · {progressPct}% complete
                          {status !== 'completed' && completed > 0 && ` · ${completed}/${total} lessons done`}
                        </p>

                        {/* Progress bar for in-progress modules */}
                        {status === 'in_progress' && (
                          <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden mb-3 max-w-xs">
                            <div className="bg-[#0056D2] h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                          </div>
                        )}

                        {/* Next lesson preview */}
                        {nextLesson && status !== 'completed' && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">{nextLessonTitle}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Video</span>
                              {nextLessonDuration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {nextLessonDuration}</span>}
                              {nextLessonHasQuiz && <span>📝 Quiz</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end flex-shrink-0">
                        {nextLesson && status !== 'completed' ? (
                          <button
                            onClick={() => navigate(`/lesson/${nextLesson.id}`)}
                            className="px-5 py-2.5 bg-[#0056D2] text-white text-sm font-semibold rounded-lg hover:bg-[#004AB5] transition-colors w-full sm:w-auto"
                          >
                            {inProg > 0 ? 'Continue' : 'Get started'}
                          </button>
                        ) : status === 'completed' ? (
                          <button
                            onClick={() => {
                              const first = lessons[0];
                              if (first) navigate(`/lesson/${first.id}`);
                            }}
                            className="px-5 py-2.5 bg-white text-[#0056D2] text-sm font-semibold rounded-lg border border-[#0056D2] hover:bg-[#0056D2]/5 transition-colors w-full sm:w-auto"
                          >
                            Review
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Your Certificates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{cert.title}</p>
                    <p className="text-xs text-gray-400">Issued: {formatDate(cert.issued_at)}</p>
                  </div>
                  {cert.pdf_url && (
                    <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm"><Download className="w-3.5 h-3.5" /></Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
