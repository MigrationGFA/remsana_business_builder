import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, LinearProgress, Badge } from '../components/remsana';
import { ArrowLeft, Play, ChevronRight, BookOpen, Trophy, Download } from 'lucide-react';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getProgramme, getLearningProgress, getCertificates } from '../api/learningApi';
import type { LearningProgramme, LearningModule, LearningLesson, LearningProgress } from '../api/learningApi';

type ModuleStatus = 'completed' | 'in_progress' | 'locked' | 'coming_soon';

interface ModuleDisplay {
  id: string;
  title: string;
  days: string;
  lessonsCompleted: number;
  totalLessons: number;
  status: ModuleStatus;
  unlockDate?: string;
  firstLessonId: string | null;
  nextLessonId: string | null;
}

export default function LearningCentrePage() {
  const navigate = useNavigate();
  const [programme, setProgramme] = useState<LearningProgramme | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Array<{ id: string; title: string; issued_at: string; pdf_url?: string }>>([]);

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

  const completedLessonIds = new Set(
    progress?.progress?.filter((p) => p.status === 'completed').map((p) => p.lesson_id) ?? []
  );

  const modulesDisplay: ModuleDisplay[] = React.useMemo(() => {
    if (!programme?.modules) return [];
    return programme.modules.map((mod: LearningModule) => {
      const lessons = mod.lessons ?? [];
      const totalLessons = lessons.length;
      const lessonsCompleted = lessons.filter((l: LearningLesson) => completedLessonIds.has(l.id)).length;
      const firstLesson = lessons[0] ?? null;
      const nextIncomplete = lessons.find((l: LearningLesson) => !completedLessonIds.has(l.id));
      const allComplete = totalLessons > 0 && lessonsCompleted >= totalLessons;
      const someComplete = lessonsCompleted > 0;
      let status: ModuleStatus = 'locked';
      if (allComplete) status = 'completed';
      else if (someComplete || (firstLesson && completedLessonIds.size === 0)) status = 'in_progress';
      return {
        id: mod.id,
        title: mod.name,
        days: `Day ${mod.day_start}-${mod.day_end}`,
        lessonsCompleted,
        totalLessons,
        status,
        firstLessonId: firstLesson?.id ?? null,
        nextLessonId: (nextIncomplete ?? firstLesson)?.id ?? null,
      };
    });
  }, [programme, completedLessonIds]);

  const currentDay = progress?.currentDay ?? 0;
  const totalDays = programme?.total_days ?? progress?.totalDays ?? 100;
  const completionPercentage = progress?.completionPercentage ?? 0;

  const getStatusBadge = (status: ModuleStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">✓ Completed</Badge>;
      case 'in_progress':
        return <Badge variant="primary">▶ In Progress</Badge>;
      case 'locked':
        return <Badge variant="neutral">🔒 Locked</Badge>;
      case 'coming_soon':
        return <Badge variant="neutral">🔜 Coming Soon</Badge>;
    }
  };

  const handleModuleClick = (mod: ModuleDisplay) => {
    if (mod.status === 'locked') return;
    const targetId = mod.status === 'completed' ? mod.firstLessonId : mod.nextLessonId;
    if (targetId) {
      navigate(`/lesson/${targetId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-[#1C1C8B] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={remsanaIcon} alt="REMSANA" className="w-9 h-9 object-contain" />
            <h1 className="text-base font-bold text-gray-900 hidden sm:block">REMSANA</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1C1C8B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Hero Progress Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#218D8D] via-[#1a7a7a] to-[#2dd4bf]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Your Progress</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Learning Centre</h2>
          <p className="text-white/50 text-sm mb-5">Day {currentDay} of {totalDays} &middot; {completionPercentage}% Complete</p>
          <div className="bg-white/20 rounded-full h-2.5 backdrop-blur-sm overflow-hidden mb-4">
            <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>
          <div className="flex gap-2">
            <button className="px-3.5 py-1.5 bg-white text-[#218D8D] text-xs font-semibold rounded-lg">All Courses</button>
            <button className="px-3.5 py-1.5 bg-white/15 text-white text-xs font-medium rounded-lg hover:bg-white/25 transition-colors">In Progress</button>
            <button className="px-3.5 py-1.5 bg-white/15 text-white text-xs font-medium rounded-lg hover:bg-white/25 transition-colors">New</button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 relative z-10 pb-8">
        {/* Programme overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden mb-6">
          <div className="h-1 bg-gradient-to-r from-[#218D8D] to-[#2dd4bf]" />
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#218D8D]/10 flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5 text-[#218D8D]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                {programme?.name ?? '100-Day SME Mastery Programme'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 ml-[47px]">
              {programme?.description ?? 'Phase 1: Business Fundamentals'}
            </p>
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-3">
          {modulesDisplay.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-sm text-gray-400">No modules available. Content will appear here once loaded.</p>
            </div>
          ) : (
            modulesDisplay.map((mod) => {
              const progressPct = mod.totalLessons > 0 ? (mod.lessonsCompleted / mod.totalLessons) * 100 : 0;
              const isClickable = mod.status !== 'locked' && mod.status !== 'coming_soon';

              return (
                <button
                  key={mod.id}
                  onClick={() => handleModuleClick(mod)}
                  disabled={!isClickable}
                  className={`w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all ${
                    isClickable ? 'hover:shadow-md hover:border-[#218D8D]/20 cursor-pointer' : 'opacity-60'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        mod.status === 'completed' ? 'bg-green-50' :
                        mod.status === 'in_progress' ? 'bg-[#218D8D]/10' :
                        'bg-gray-100'
                      }`}>
                        <Play className={`w-5 h-5 ${
                          mod.status === 'completed' ? 'text-green-500' :
                          mod.status === 'in_progress' ? 'text-[#218D8D]' :
                          'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {mod.days}: {mod.title}
                          </h4>
                          {getStatusBadge(mod.status)}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {mod.lessonsCompleted}/{mod.totalLessons} lessons completed
                        </p>
                        {mod.status === 'in_progress' && (
                          <div className="mt-2.5">
                            <LinearProgress value={progressPct} className="mb-1" />
                          </div>
                        )}
                      </div>
                      {isClickable && (
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Your Certificates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{cert.title}</p>
                    <p className="text-[11px] text-gray-400">Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                  </div>
                  {cert.pdf_url && (
                    <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
