import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, LinearProgress, Badge } from '../components/remsana';
import { ArrowLeft, Play, ChevronRight, ChevronDown, BookOpen, Trophy, Download, Clock, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getProgramme, getLearningProgress, getCertificates } from '../api/learningApi';
import type { LearningProgramme, LearningModule, LearningLesson, LearningProgress } from '../api/learningApi';

type LessonStatus = 'completed' | 'in_progress' | 'not_started';

function formatDurationShort(sec?: number): string {
  if (!sec || sec <= 0) return '';
  const n = Number(sec);
  if (n < 60) return `${n}s`;
  return `${Math.floor(n / 60)}m`;
}

export default function LearningCentrePage() {
  const navigate = useNavigate();
  const [programme, setProgramme] = useState<LearningProgramme | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Array<{ id: string; title: string; issued_at: string; pdf_url?: string }>>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([getProgramme('100DAY_SME'), getLearningProgress(), getCertificates()])
      .then(([progData, progressData, certs]) => {
        setProgramme(progData);
        setProgress(progressData);
        setCertificates(certs);
        // Auto-expand first in-progress module
        if (progData?.modules) {
          const firstInProgress = progData.modules.find((m) => {
            const lessons = m.lessons ?? [];
            const completed = lessons.filter((l) =>
              progressData?.progress?.some((p) => p.lesson_id === l.id && p.status === 'completed')
            ).length;
            return completed > 0 && completed < lessons.length;
          });
          if (firstInProgress) setExpandedModules(new Set([firstInProgress.id]));
        }
      })
      .catch((err) => {
        console.error('Failed to load learning data:', err);
        setError('Failed to load courses. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Build lookup maps from progress data
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

  const currentDay = progress?.currentDay ?? 0;
  const totalDays = programme?.total_days ?? progress?.totalDays ?? 100;
  const lessonsCompleted = progress?.lessonsCompleted ?? completedLessonIds.size;
  const totalLessons = progress?.totalLessons ?? (programme?.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0);
  const averageScore = progress?.averageScore ?? 0;

  // Compute a blended progress that includes partial credit for in-progress lessons.
  // The backend's completionPercentage only counts fully completed lessons, so a user
  // who watched 95% of a video and passed the quiz still sees 0% until markLessonComplete fires.
  const completionPercentage = React.useMemo(() => {
    const backendPct = progress?.completionPercentage ?? 0;
    if (totalLessons <= 0) return backendPct;
    // Give in-progress lessons partial credit based on video watch progress
    const allLessons = programme?.modules?.flatMap((m) => m.lessons ?? []) ?? [];
    let blendedScore = completedLessonIds.size; // 1.0 per completed lesson
    for (const lid of inProgressLessonIds) {
      const lp = progressByLesson.get(lid);
      if (lp && lp.video_progress_sec > 0) {
        const lesson = allLessons.find((l) => l.id === lid);
        const dur = Number(lesson?.duration_sec) || 0;
        if (dur > 0) {
          blendedScore += Math.min(lp.video_progress_sec / dur, 0.95); // cap at 95% credit
        } else {
          blendedScore += 0.5; // no duration known, give half credit
        }
      } else {
        blendedScore += 0.1; // just started, small credit
      }
    }
    const blendedPct = Math.round((blendedScore / totalLessons) * 100);
    return Math.max(backendPct, blendedPct); // show whichever is higher
  }, [progress, programme, totalLessons, completedLessonIds, inProgressLessonIds, progressByLesson]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const getLessonStatus = (lessonId: string): LessonStatus => {
    if (completedLessonIds.has(lessonId)) return 'completed';
    if (inProgressLessonIds.has(lessonId)) return 'in_progress';
    return 'not_started';
  };

  const getLessonStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4.5 h-4.5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-4.5 h-4.5 text-[#218D8D]" />;
      default:
        return <Circle className="w-4.5 h-4.5 text-gray-300" />;
    }
  };

  const getModuleStatus = (mod: LearningModule) => {
    const lessons = mod.lessons ?? [];
    const total = lessons.length;
    const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
    const started = lessons.filter((l) => inProgressLessonIds.has(l.id)).length;
    if (total > 0 && completed >= total) return 'completed' as const;
    if (completed > 0 || started > 0 || (total > 0 && completedLessonIds.size === 0)) return 'in_progress' as const;
    return 'locked' as const;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">✓ Completed</Badge>;
      case 'in_progress':
        return <Badge variant="primary">▶ In Progress</Badge>;
      case 'locked':
        return <Badge variant="neutral">🔒 Locked</Badge>;
      default:
        return <Badge variant="neutral">🔜 Coming Soon</Badge>;
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
          <div className="bg-white/20 rounded-full h-2.5 backdrop-blur-sm overflow-hidden mb-5">
            <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <p className="text-white text-lg font-bold">{lessonsCompleted}/{totalLessons}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Lessons Done</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <p className="text-white text-lg font-bold">{averageScore > 0 ? `${Math.round(averageScore)}%` : '—'}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Avg Score</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <p className="text-white text-lg font-bold">{certificates.length}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Certificates</p>
            </div>
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
          {!programme?.modules?.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-sm text-gray-400">No modules available. Content will appear here once loaded.</p>
            </div>
          ) : (
            programme.modules.map((mod: LearningModule) => {
              const lessons = mod.lessons ?? [];
              const total = lessons.length;
              const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
              const inProg = lessons.filter((l) => inProgressLessonIds.has(l.id)).length;
              const status = getModuleStatus(mod);
              // Blended module progress: full credit for completed, partial for in-progress
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
              const progressPct = total > 0 ? Math.min((moduleScore / total) * 100, 100) : 0;
              const isExpanded = expandedModules.has(mod.id);
              const isClickable = status !== 'locked';

              return (
                <div
                  key={mod.id}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all ${
                    isClickable ? 'hover:shadow-md hover:border-[#218D8D]/20' : 'opacity-60'
                  }`}
                >
                  {/* Module header */}
                  <button
                    onClick={() => isClickable && toggleModule(mod.id)}
                    disabled={!isClickable}
                    className="w-full text-left p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        status === 'completed' ? 'bg-green-50' :
                        status === 'in_progress' ? 'bg-[#218D8D]/10' :
                        'bg-gray-100'
                      }`}>
                        <Play className={`w-5 h-5 ${
                          status === 'completed' ? 'text-green-500' :
                          status === 'in_progress' ? 'text-[#218D8D]' :
                          'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            Day {mod.day_start}-{mod.day_end}: {mod.name}
                          </h4>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {completed}/{total} lessons completed{inProg > 0 ? ` · ${inProg} in progress` : ''}
                        </p>
                        {status === 'in_progress' && (
                          <div className="mt-2.5">
                            <LinearProgress value={progressPct} className="mb-1" />
                          </div>
                        )}
                      </div>
                      {isClickable && (
                        isExpanded
                          ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform" />
                          : <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1 transition-transform" />
                      )}
                    </div>
                  </button>

                  {/* Expanded lesson list */}
                  {isExpanded && lessons.length > 0 && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {lessons.map((lesson: LearningLesson) => {
                        const ls = getLessonStatus(lesson.id);
                        const lp = progressByLesson.get(lesson.id);
                        const durationSec = Number(lesson.duration_sec) || 0;
                        const watchedSec = lp?.video_progress_sec ?? 0;
                        const watchPct = durationSec > 0 ? Math.min(Math.round((watchedSec / durationSec) * 100), 100) : 0;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => navigate(`/lesson/${lesson.id}`)}
                            className="w-full text-left px-5 py-3 hover:bg-[#f8f6ff] transition-colors flex items-center gap-3"
                          >
                            {getLessonStatusIcon(ls)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-[#218D8D]">Day {lesson.day_number}</span>
                                <span className="text-[13px] font-medium text-gray-800 truncate">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                {durationSec > 0 && (
                                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" /> {formatDurationShort(durationSec)}
                                  </span>
                                )}
                                {lesson.has_quiz && (
                                  <span className="text-[10px] text-gray-400">📝 Quiz</span>
                                )}
                                {ls === 'in_progress' && watchPct > 0 && (
                                  <span className="text-[10px] text-[#218D8D] font-medium">{watchPct}% watched</span>
                                )}
                                {ls === 'completed' && lp?.completed_at && (
                                  <span className="text-[10px] text-green-500">
                                    Done {new Date(lp.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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
